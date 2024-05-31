const express = require('express')
const router = express.Router()
const { Users } = require('../models')
const bcrypt = require('bcrypt')

router.post('/', async (req, res) => {
    const { name, email, password } = req.body

    bcrypt.hash(password, 10).then((hash) => {
        Users.create({
            name: name,
            email: email,
            password: hash
        })

        res.json('Success')
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

        res.json("Logado")
    })
})

module.exports = router