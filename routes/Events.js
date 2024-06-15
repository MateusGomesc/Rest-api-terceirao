const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const { Events } = require('../models')
const { Products } = require('../models')

// multer configure

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'upload/banners'

        // verify files exists
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true })
        }

        cb(null, 'upload/banners')
    },
    filename: (req, file, cb) => {
        // Save filename with extension or orginal name
        const filename = req.body.name + "." + file.originalname.split('.')[1] || file.originalname
        cb(null, filename) 
    }
})

const upload = multer({ storage })

router.post('/register', upload.single('image'), async (req, res) => {
    const { name, date, location, status } = req.body
    const products = JSON.parse(req.body.products)

    Events.create({
        name: name,
        date: date,
        location: location,
        image: req.file.path,
        status: status === 'Fechado' ? 0 : 1
    }).then((data) => {
        products.map((item) => {
            Products.create({
                name: item.name,
                price: item.price,
                EventId: data.dataValues.id
            })
        })

        res.json('Evento criado com sucesso')
    })
})

router.patch('/modify/:id', upload.single('image'), async (req, res) => {
    const { name, date, location, status } = req.body
    const products = JSON.parse(req.body.products)
    const id = req.params.id

    const updateDataEvent = {
        name: name,
        date: date,
        location: location,
        image: req.file.path,
        status: status === 'Fechado' ? 0 : 1
    }

    try{
        await Events.update(updateDataEvent, { where: { id: id } })
        await products.map((item) => {
            const updateDataProducts = {
                name: item.name,
                price: item.price,
                EventId: id
            }
    
            Products.update(updateDataProducts, { where: { id: item.id } })
        })
    
        res.json('Evento atualizado com sucesso')
    }
    catch(error){
        console.error(error)
        res.status(500).json('Erro ao atualizar o evento')
    }
})

router.get('/', async (req, res) => {
    const events = await Events.findAll()
    res.json(events)
})

router.get('/open', async (req, res) => {
    const events = await Events.findAll({ where: { status: true } })
    res.json(events)
})

router.get('/:id', async (req, res) => {
    const eventId = req.params.id
    const event = await Events.findOne({ where: { id: eventId } })
    const products = await Products.findAll({ where: { EventId: eventId } })
    
    res.json({ event, products })
})


module.exports = router