const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const controllers = require('./controllers')
const exceptions = require('./exceptions')
const mongodb = require('./database/mongodb')
const app = new Koa()
const config = require('./config')
app.keys = [config.server.secret_key]
app.use(bodyParser())
app.use(logger())
app.use(koaBody())
exceptions.init_app(app)
mongodb.getDB('smart_tv', config.mongodb).then(smart_tv_db => {
    app.context.smart_tv_db = smart_tv_db
}).catch(err => {
    app.emit('error', err)
})

controllers.init_app(app)

module.exports = app
if (!module.parent) {
    app.listen(config.server.port)
}