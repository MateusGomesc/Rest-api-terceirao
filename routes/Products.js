const express = require('express')
const router = express.Router()
const { Products } = require('../models')

router.post('/', async (req, res) => {
    const { ids } = req.body

    try{
        // walking in ids
        const products = await Promise.all(
            ids.map(async (id) => {
                // finding id in database and returning the name
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