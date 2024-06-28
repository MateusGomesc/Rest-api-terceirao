const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const cloudinary = require('cloudinary').v2
const { Events } = require('../models')
const { Products } = require('../models')

// multer configure

/* const storage = multer.diskStorage({
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
}) */

// cloudinary configuration

cloudinary.config({ 
    cloud_name: 'dtqohmifx', 
    api_key: '536416356178299', 
    api_secret: 'ZUFpZAjrcDQFRD2gOmaBmIOOAPY',
    secure: true,
});

async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return res;
}

const storage = new multer.memoryStorage()
const upload = multer({ storage })

router.post('/register', upload.single('image'), async (req, res) => {
    const { name, date, location, status } = req.body
    const products = JSON.parse(req.body.products)

    try{
        // image upload
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI);

        Events.create({
            name: name,
            date: date,
            location: location,
            image: cldRes.url,
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
    }
    catch{
        res.json('não foi possível criar o evento')
    }
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
        const event = await Events.update(updateDataEvent, { where: { id: id } })
        await Promise.all(products.map((item) => {
            return Products.create({
                name: item.name,
                price: item.price,
                EventId: event.dataValues.id
            });
        }));
    
        res.json('Evento atualizado com sucesso')
    }
    catch(error){
        console.log('Erro ao criar o evento: ' + error)
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
            return res.status(404).json({ error: 'Evento não foi encontrado para atualização' })
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
        const eventDelete = await Events.destroy({ where: { id: id } })

        if(!eventDelete){
            res.json({ error: 'Evento não encontrado' })
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