const express = require('express')
const router = express.Router()
const { Products } = require('../models')

router.post('/', async (req, res) => {
    const { ids } = req.body
    console.log(ids)

    try{
        const products = await Promise.all(
            ids.map(async (id) => {
                const product = await Products.findOne({ where: { id: id } })
                return product.name
            })
        );

        res.json(products)
    }
    catch{
        res.json({ error: 'Não foi possível buscar os produtos' })
    }
})

module.exports = router