const express = require('express')
const app = express()
const db = require('./models')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT, PATCH, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-requested-with')
    app.use(cors())
    next()
})

app.use(express.json())
app.use(express.static('./public'))

// Routers
const UsersRouters = require('./routes/Users')
app.use('/auth', UsersRouters)

const EventsRouters = require('./routes/Events')
app.use('/events', EventsRouters)

const OrdersRouters = require('./routes/Orders')
app.use('/orders', OrdersRouters)

const ProductsRouters = require('./routes/Products')
app.use('/products', ProductsRouters)

db.sequelize.sync().then(() => {
    app.listen(process.env.PORT || 3001, () => {
        console.log('Server is running in port 3001')
    })
})