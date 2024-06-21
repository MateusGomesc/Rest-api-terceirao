const express = require('express')
const router = express.Router()
const { Users } = require('../models')
const bcrypt = require('bcrypt')
const { sign, verify } = require('jsonwebtoken')
require('dotenv').config()

router.post('/', async (req, res) => {
    const { name, email, password } = req.body

    // Verify user was registered
    const user = await Users.findOne({ where: { email: email } })

    if(user){
        return res.json({ error: "Email já cadastradado"})
    }

    bcrypt.hash(password, 10).then((hash) => {
        Users.create({
            name: name,
            email: email,
            password: hash
        })

        res.json('Usuário criado com sucesso')
    })
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try{
        const user = await Users.findOne({ where: { email: email } })
    
        if(!user){
            return res.json({ error: 'Usuário não existe'})
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