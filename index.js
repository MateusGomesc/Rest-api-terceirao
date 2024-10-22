const express = require('express')
const app = express()
const db = require('./models')
const { HeaderMiddleware } = require('./middlewares/HeaderMiddlewares')
const cors = require('cors')
require('dotenv').config()

app.use(HeaderMiddleware)
app.use(cors())
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
        console.log('Server is running')
    })
})