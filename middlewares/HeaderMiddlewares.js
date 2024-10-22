const HeaderMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT, PATCH, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-requested-with')
    next()
}

module.exports = { HeaderMiddleware }