const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
})

const db = {
    sequelize: sequelize,
    User: require('./user')(sequelize, Sequelize)
}

module.exports = db

db.sequelize.sync({ alert: true}).then(() => {
    console.log('Database sync')
})