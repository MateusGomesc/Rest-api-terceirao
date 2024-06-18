const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { Orders } = require('../models')
const { OrdersItems } = require('../models')

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

router.post('/', upload.single('proof'), async (req, res) => {
    console.log(req)
    const { user, event, price, payMethod } = req.body
    const products = JSON.parse(req.body.products)
    
    Orders.create({
        price: price,
        payMethod: payMethod,
        eventId: event,
        userId: user,
        proof: req.file.path,
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

        res.json('Pedido concluído com sucesso')
    })
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
        res.status(500).json({ error: 'Não foi possível encontrar o pedido' })
    }
})

module.exports = router