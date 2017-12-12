const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const controllers = require('./controllers')
const exceptions = require('./exceptions')
const mongodb = require('./database/mongodb')
const app = new Koa()
const config = require('./config')
const WechatAPI = require('co-wechat-api')

app.keys = [config.server.secret_key]
app.use(bodyParser())
app.use(logger())
exceptions.init_app(app)
mongodb.getDB('smart_tv', config.mongodb).then(smart_tv_db => {
    app.context.smart_tv_db = smart_tv_db
    const appid = config.weixin_didi.appid
    const appsecret = config.weixin_didi.appsecret
    let weixin_api = new WechatAPI(appid, appsecret, async() => {
        let weixin_config = await smart_tv_db.collection('weixin_config').findOne({ appid: appid })
        return weixin_config
    }, async(token) => {
        smart_tv_db.collection('weixin_config').updateOne({ appid: appid }, { $set: { appid: appid, accessToken: token.accessToken, expireTime: token.expireTime } }, { upsert: true })
    })
    weixin_api.registerTicketHandle(async(type) => {
        let weixin_config = await smart_tv_db.collection('weixin_config').findOne({ appid: appid })
        if (weixin_config) {
            return { ticket: weixin_config[type + '_ticket'], expireTime: weixin_config[type + '_expireTime'] }
        }
    }, async(type, ticket) => {
        let update_obj = {
            appid: appid
        }
        update_obj[type + '_ticket'] = ticket.ticket
        update_obj[type + '_expireTime'] = ticket.expireTime
        smart_tv_db.collection('weixin_config').updateOne({ appid: appid }, { $set: update_obj }, { upsert: true })
    })
    app.context.weixin_api = weixin_api
}).catch(err => {
    app.emit('error', err)
})

controllers.init_app(app)

module.exports = app
if (!module.parent) {
    app.listen(config.server.port)
}