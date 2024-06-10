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

router.get('/', async (req, res) => {
    const events = await Events.findAll()

    res.json(events)
})

router.get('/:id', async (req, res) => {
    const eventId = req.params.id
    const event = await Events.findOne({ where: { id: eventId } })
    res.json(event)
})

module.exports = router