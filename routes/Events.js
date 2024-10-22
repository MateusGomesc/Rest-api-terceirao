const express = require('express')
const router = express.Router()
const multer = require('multer')
const { Events } = require('../models')
const { Products } = require('../models')
const axios = require('axios')
require('dotenv').config()

// Configure multer
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/register', upload.single('image') , async (req, res) => {
    const { name, date, location, status } = req.body
    const products = JSON.parse(req.body.products)
    const file = req.file
    let imageUrl = ''
    let deleteHash = ''

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
            deleteHash = response.data.data.deletehash
        })
    }

    try{
        // create event
        await Events.create({
            name: name,
            date: date,
            location: location,
            image: imageUrl,
            deleteHash: deleteHash,
            status: status === 'Fechado' ? 0 : 1
        }).then(async (data) => {
            // create products
            await Promise.all(
                products.map(async (item) => {
                    await Products.create({
                        name: item.name,
                        price: item.price,
                        EventId: data.dataValues.id
                    })
                })
            )
            res.json('Evento criado com sucesso')
        })
    }
    catch(error){
        res.json('não foi possível criar o evento ' + error)
    }
})

router.patch('/modify/:id', async (req, res) => {
    const { name, date, location, status } = req.body
    const products = JSON.parse(req.body.products)
    const id = req.params.id

    try{
        // update object
        const updateDataEvent = {
            name: name,
            date: date,
            location: location,
            status: status === 'Fechado' ? 0 : 1
        }

        // update event
        await Events.update(updateDataEvent, { where: { id: id } })

        // verify if products exists
        const existingProducts = await Products.findAll({ where: { EventId: id } })
        const existingProductIds = existingProducts.map(product => product.id)

        // update products
        await Promise.all(products.map(async (item) => {
            // Verify if product exists in database
            if(item.id && existingProductIds.includes(item.id)){
                await Products.update({
                    name: item.name,
                    price: item.price,
                    EventId: id
                }, { where: { id: item.id } });
            }
            else{
                await Products.create({
                    name: item.name,
                    price: item.price,
                    EventId: id
                });
            }
        }));
    
        res.json('Evento atualizado com sucesso')
    }
    catch{
        res.json('Erro ao atualizar o evento')
    }
})

router.get('/', async (req, res) => {
    try{
        const events = await Events.findAll()
        res.json(events)
    }
    catch{
        res.json('não foi possível buscar os eventos')
    }
})

router.get('/open', async (req, res) => {
    try{
        const events = await Events.findAll({ where: { status: true } })
        res.json(events)
    }
    catch{
        res.json('não foi possível buscar os eventos')
    }
})

router.get('/:id', async (req, res) => {
    const eventId = req.params.id

    try{
        const event = await Events.findOne({ where: { id: eventId } })
        const products = await Products.findAll({ where: { EventId: eventId } })
        
        res.json({ event, products })
    }
    catch{
        res.json('Não foi possível buscar o evento')
    }
})

router.patch('/status/:id', async (req, res) => {
    const id = req.params.id
    const update = req.body

    try{
        const event = Events.findOne({ where: { id: id } })
        event.status = update.status
        const data = Events.update(event, { where: { id: id } })

        if(!data){
            return res.json({ error: 'Evento não foi encontrado para atualização' })
        }

        res.json('Status atualizado com sucesso')
    }
    catch{
        res.json({ error: 'Não foi possível atualizar o status do evento' })
    }
})

router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id

    try{
        // fetching event in database
        const event = await Events.findOne({ where: { id: id } })

        // deleting image from imgur
        await axios.post(`https://api.imgur.com/3/image/${event.deleteHash}`, {
            headers: {
                Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
            }
        })

        const eventDelete = await Events.destroy({ where: { id: id } })

        if(!eventDelete){
            res.json({ error: 'Evento não foi deletado' })
        }
        else{
            res.json('Evento deletado com sucesso')
        }
    }
    catch{
        res.json({ error: 'Não foi possível deletar o evento' })
    }
})


module.exports = router