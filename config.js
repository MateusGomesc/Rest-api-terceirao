require('dotenv').config()
const mysql = require('mysql2')

const urlDB = "mysql://root:vUQiOsdbLoXKNlpoJsuzepEferWQbloK@roundhouse.proxy.rlwy.net:18905/railway"

const connection = mysql.createConnection(urlDB)

module.exports = connection