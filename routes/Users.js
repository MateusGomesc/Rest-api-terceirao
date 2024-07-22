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
        console.log(token)
        const user = await Users.findOne({ where: { validation: token } })

        if(!user){
            return res.sendFile(path.join(__dirname, '../public/confirmation-user.html'))
        }

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
        const user = await Users.findOne({ where: { email: email } })
    
        if(!user){
            return res.json({ error: 'Usuário não existe'})
        }

        if(!user.checked){
            return res.json({ error: 'Confirme seu email' })
        }
    
        bcrypt.compare(password, user.password).then((match) => {
            if(!match){
                return res.json({ error: 'Usuário e senha não conferem'})
            }
    
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
        const decodedToken = verify(acessToken, process.env.SECRET)
        const userReq = await Users.findOne({ where: { id: decodedToken.id } })

        const passwordMatch = await bcrypt.compare(password, userReq.password)

        if(!passwordMatch) {
            return res.json({ error: 'Senha incorreta' });
        }
        else{
            const user = await Users.findOne({ where: { email: email }  })

            if(user.isAdmin){
                return res.json({ error: 'Usuário já é administrador'})
            }

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