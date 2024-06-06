const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')

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
    console.log(req.body, req.file)
    res.json({ msg: 'ok' })
})

module.exports = router