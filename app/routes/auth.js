var router = require('express').Router()

const {auth} = require('../controller')

module.exports = app => {
    router.post('/login', auth.login)
    router.put('/update', auth.update)
    router.post('/logout', auth.login)

    app.use('/', router)
}