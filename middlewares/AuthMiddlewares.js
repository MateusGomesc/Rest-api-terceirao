const { verify } = require('jsonwebtoken')
require('dotenv').config()

const validationUser = (req, res, next) => {
    const acessToken = req.header('acessToken')

    if(!acessToken){
        return res.json({ error: 'Usuário não está logado' })
    }

    try{
        const validToken = verify(acessToken, process.env.SECRET)

        if(validToken){
            return next()
        }
    }
    catch(error){
        return res.json({ error: error })
    }
}

module.exports = { validationUser }