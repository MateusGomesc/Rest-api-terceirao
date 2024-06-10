const express = require('express')
const router = express.Router()
const { Products } = require('../models')

router.get('/:eventId', async (req, res) => {
    const eventId = req.params.eventId
    const products = await Products.findAll({ where: { EventId: eventId } })
    res.json(products)
})

module.exports = router
