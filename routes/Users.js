const express = require('express')
const router = express.Router()
const { Users } = require('../models')
const bcrypt = require('bcrypt')
const { sign } = require('jsonwebtoken')
require('dotenv').config()

router.post('/', async (req, res) => {
    const { name, email, password } = req.body

    // Verify user was registered
    const user = await Users.findOne({ where: { email: email } })

    if(user){
        res.json({ error: "Email já cadastradado"})
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

    const user = await Users.findOne({ where: { email: email } })

    if(!user){
        res.json({ error: 'Usuário não existe'})
    }

    bcrypt.compare(password, user.password).then((match) => {
        if(!match){
            res.json({ error: 'Usuário e senha não conferem'})
        }

        const acessToken = sign({email: user.email, id: user.id, isAdmin: user.isAdmin}, process.env.SECRET)
        res.json(acessToken)
    })
})

module.exports = router