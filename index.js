const express = require('express')
const app = express()
const db = require('./models')
const cors = require('cors')

app.use(cors())
app.use(express.json())

// Routers
const UsersRouters = require('./routes/Users')
app.use('/auth', UsersRouters)

const EventsRouters = require('./routes/Events')
app.use('/events', EventsRouters)

db.sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log('Server is running in port 3001')
    })
})