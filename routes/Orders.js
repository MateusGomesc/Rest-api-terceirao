const express = require('express')
const router = express.Router()
const multer = require('multer')
const axios = require('axios')
const { Orders } = require('../models')
const { OrdersItems } = require('../models')
const { Users } = require('../models')
const { Events } = require('../models')

// configure multer
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/pix', upload.single('proof'), async (req, res) => {
    const { user, event, price, payMethod, terms } = req.body
    const products = JSON.parse(req.body.products)
    const file = req.file
    let imageUrl = ''

    if(file){
        // Convert image to base64
        const buffer = file.buffer
        const base64 = buffer.toString('base64')

        await axios.post('https://api.imgur.com/3/image', {
            image: base64,
            type: 'base64'
        }, {
            headers: {
                Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
            }
        }).then(response =>{ 
            imageUrl = response.data.data.link
        })
    }

    try{
        // Create order 
        await Orders.create({
            price: price,
            payMethod: payMethod,
            eventId: event,
            userId: user,
            proof: imageUrl,
            terms: terms,
            received: 0
        }).then((data) => {
            // Walking in product object
            Object.keys(products).forEach(async (prop) => {
                if(products[prop]){
                    await OrdersItems.create({
                        OrderId: data.id,
                        ProductId: prop,
                        quantity: products[prop]
                    })
                }
            })
    
            res.json(data)
        })
    }
    catch{
        res.json('Não foi possível realizar a compra')
    }
})

router.post('/cash', async (req, res) => {
    const { user, event, price, payMethod, terms } = req.body
    const products = JSON.parse(req.body.products)

    try{
        // Create order
        await Orders.create({
            price: price,
            payMethod: payMethod,
            eventId: event,
            userId: user,
            terms: terms,
            received: 0
        }).then((data) => {
            // Walking in product objects
            Object.keys(products).forEach(async (prop) => {
                if(products[prop]){
                    await OrdersItems.create({
                        OrderId: data.id,
                        ProductId: prop,
                        quantity: products[prop]
                    })
                }
            })
    
            res.json(data)
        })
    }
    catch{
        res.json('Não foi possível realizar a compra')
    }
})

router.get('/:id', async (req, res) => {
    const id = req.params.id

    try{
        const order = await Orders.findOne({ where: { id: id } })
        const items = await OrdersItems.findAll({ where: { OrderId: id } })

        if(!order){
            res.json({ error: 'Não foi possível encontrar o pedido' })
        }
        else{
            res.json({ order, items })
        }
    }
    catch{
        res.json({ error: 'Não foi possível encontrar o pedido' })
    }
})

router.get('/event/:id', async (req, res) => {
    const id = req.params.id

    try{
        const orders = await Orders.findAll({ where: { eventId: id } })

        if(!orders.length){
            return res.json({ error: 'Não foi possível encontrar o pedido' })
        }

        const ordersWithItems = await Promise.all(
            // Walking in order array
            orders.map(async (order) => {
                // Search items of order
                const items = await OrdersItems.findAll({ where: { OrderId: order.id } })

                // Search user of order
                const username = await Users.findOne({ where: { id: order.userId } })

                // Return order with items and user
                order.items = items || []
                return {
                    ...order.toJSON(),
                    username: username.name,
                    items: items
                }
            })
        )

        res.json(ordersWithItems)
    }
    catch{
        res.json({ error: 'Não foi possível encontrar o pedido' })
    }
})

router.get('/hasShop/:eventId/:userId', async (req, res) => {
    const { eventId, userId } = req.params

    try{
        const orders = await Orders.findAll({ where: { eventId: eventId, userId: userId } })

        if(orders.length > 0){
            res.json({ status: 0, message: 'Você já comprou nesse evento' })
        }
        else{
            res.json({ status: 1 })
        }
    }
    catch{
        res.json({ error: 'Não foi possível resgatar os dados' })
    }
})

router.get('/user/:id', async (req, res) => {
    const id = req.params.id

    try{
        const orders = await Orders.findAll({ where: { userId: id } })

        if(!orders.length){
            return res.json({ error: 'Nenhum evento foi encontrado' })
        }

        const completeOrders = await Promise.all(
            orders.map(async (order) => {
                const event = await Events.findOne({ where: { id: order.eventId } })

                return {
                    order,
                    event
                }
            })
        )

        res.json(completeOrders)
    }
    catch{
        res.json({ error: 'Não foi possível resgatar suas compras' })
    }
})

router.put('/check/:id', async (req, res) => {
    const id = req.params.id 

    try{
        const order = await Orders.findOne({ where: { id: id } })

        if(!order){
            return res.json({ error: 'Não possível encontrar o pedido' })
        }

        // Receive current value
        let currentValue = order['received']

        // Invert value of status
        let updatedValue = !currentValue

        await Orders.update({ ['received']: updatedValue }, { where: { id: id } })
        res.json('Status atualizado')
    }
    catch{
        res.json({ error: 'Não foi possível atualizar o status da compra' })
    }
})

module.exports = router