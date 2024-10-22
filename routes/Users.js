const express = require('express')
const router = express.Router()
const { Users } = require('../models')
const bcrypt = require('bcryptjs')
const { sign, verify } = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const path = require('path')
require('dotenv').config()

router.post('/', async (req, res) => {
    const { name, email, password } = req.body

    try{
        // Verify user was registered
        const user = await Users.findOne({ where: { email: email } })
    
        if(user){
            return res.json({ error: "Email já cadastradado"})
        }
        
        // hash password and send to databse
        bcrypt.hash(password, 10).then(async (hash) => {
            const NewUser = await Users.create({
                name: name,
                email: email,
                password: hash
            })

            // nodemailer configure
            
            let transponder = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                }
            })

            const emailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Confirme seu email',
                text: `Confirme seu email clicando no link a seguir: ${process.env.BASE_URL}/auth/email/${NewUser.validation}`
            }

            // send email
            transponder.sendMail(emailOptions, (error, info) => {
                if(error){
                    return res.json({ error: error })
                }
            })

            res.json('Confirme seu email')
        })
    }
    catch{
        res.json('Não foi possível cadastrar o usuário')
    }
})

router.get('/email/:token', async (req, res) => {
    const token = req.params.token

    try{
        // Verify if users was validated
        const user = await Users.findOne({ where: { validation: token } })

        if(!user){
            return res.sendFile(path.join(__dirname, '../public/confirmation-user.html'))
        }

        // update validation in database
        await Users.update({
            checked: new Date(),
            validation: ''
        }, { where: { id: user.id } })

        res.sendFile(path.join(__dirname, '../public/confirmation-success.html'))
    }
    catch{
        res.sendFile(path.join(__dirname, '../public/confirmation-failed.html'))
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try{
        // search user in database
        const user = await Users.findOne({ where: { email: email } })
        
        // error tests
        if(!user){
            return res.json({ error: 'Usuário não existe'})
        }

        if(!user.checked){
            return res.json({ error: 'Confirme seu email' })
        }
        
        // Compare passwords
        bcrypt.compare(password, user.password).then((match) => {
            // Verify if password is correct
            if(!match){
                return res.json({ error: 'Usuário e senha não conferem'})
            }
            
            // Generate the acess token
            const acessToken = sign({email: user.email, id: user.id, isAdmin: user.isAdmin}, process.env.SECRET)
            res.json(acessToken)
        })
    }
    catch{
        res.json({ error: 'Não foi possível realizar o login' })
    }
})

router.post('/setAdmin', async (req, res) => {
    const { email, password, acessToken } = req.body

    try{
        // Decod acess token
        const decodedToken = verify(acessToken, process.env.SECRET)

        // Verify if existent user really exists
        const userReq = await Users.findOne({ where: { id: decodedToken.id } })

        // Verify if passwords match
        const passwordMatch = await bcrypt.compare(password, userReq.password)

        if(!passwordMatch) {
            return res.json({ error: 'Senha incorreta' });
        }
        else{
            // search user in database
            const user = await Users.findOne({ where: { email: email }  })

            if(user.isAdmin){
                return res.json({ error: 'Usuário já é administrador'})
            }

            // trasform user in admin
            user.isAdmin = true;
            await user.save();
            res.json('Administrador(a) cadastrado(a) com sucesso')
        }
    }
    catch{
        res.json({ error: 'Não foi possível modificar o usuário'})
    }
})

module.exports = router