const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { Orders } = require('../models')
const { OrdersItems } = require('../models')
const { Users } = require('../models')
const { Events } = require('../models')

// multer configure

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join('upload/proofs', req.body.event)

        // verify files exists
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true })
        }

        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        // Save filename with extension or orginal name
        const filename = req.body.user + "." + file.originalname.split('.')[1] || file.originalname
        cb(null, filename) 
    }
})

const upload = multer({ storage })

router.post('/pix', upload.single('proof'), async (req, res) => {
    const { user, event, price, payMethod, terms } = req.body
    const products = JSON.parse(req.body.products)
    console.log(products, req.body.products)
    
    try{
        Orders.create({
            price: price,
            payMethod: payMethod,
            eventId: event,
            userId: user,
            proof: req.file.path,
            terms: terms
        }).then((data) => {
            Object.keys(products).forEach((prop) => {
                if(products[prop]){
                    OrdersItems.create({
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
        Orders.create({
            price: price,
            payMethod: payMethod,
            eventId: event,
            userId: user,
            terms: terms
        }).then((data) => {
            Object.keys(products).forEach((prop) => {
                if(products[prop]){
                    OrdersItems.create({
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
            orders.map(async (order) => {
                const items = await OrdersItems.findAll({ where: { OrderId: order.id } })
                const username = await Users.findOne({ where: { id: order.userId } })

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
        console.log(orders)

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
    catch(error){
        console.log(error)
        res.json({ error: 'Não foi possível resgatar suas compras' })
    }
})

module.exports = router