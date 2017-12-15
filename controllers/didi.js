const BaseController = require('./base')
const ObjectID = require('mongodb').ObjectID

module.exports = class DidiController extends BaseController {
    async get_gift(ctx) {
        let prize_count = {
            '1': 0,
            '2': 118,
            '3': 218,
            '4': 388
        }
        let result = await ctx.smart_tv_db.collection('didi_prize').aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]).toArray()
        let sum = 0
        result.forEach(group => {
            prize_count[group._id] -= group.count
            if (prize_count[group._id] < 0) {
                prize_count[group._id] = 0
            }
        })
        for (let key in prize_count) {
            sum += prize_count[key];
        }
        sum *= 200
        let type = 5
        if (sum) {
            let r = Math.ceil(Math.random() * sum)
            let s = []
            for (let i = 0; i <= 4; i++) {
                if (!i) {
                    s[i] = 0
                } else {
                    s[i] = s[i - 1] + prize_count[i]
                    if (r > s[i - 1] && r <= s[i]) {
                        type = i
                        break
                    }
                }
            }
        }
        console.log('prize_count: ', Object.values(prize_count).concat(sum).toString() + ',type:' + type);
        let order = {
            type,
            is_used: false,
            created_at: Date.now()
        }
        let insert_result = await ctx.smart_tv_db.collection('didi_order').insertOne(order)
        order.order_id = order._id
        delete order._id
        ctx.smart_tv_db.collection('didi_stat').insertOne({ ip: ctx.request.headers['x-real-ip'], action: 'get_gift', from: ctx.request.headers.referer, t: Date.now(), ua: ctx.request.headers['user-agent'], extra: { order } })
        ctx.body = super.success_with_result(order)
    }
    async order_contact(ctx) {
        let order_id = ctx.request.body.order_id
        let contact = {
            name: ctx.request.body.name,
            phone: ctx.request.body.phone,
            address: ctx.request.body.address,
            created_at: Date.now()
        }

        let order = await ctx.smart_tv_db.collection('didi_order').findOne({ _id: ObjectID(order_id) })
        if (!order || order.is_used) {
            ctx.body = super.error_with_message(403, '你已经兑换奖品了，欢迎关注滴滴优享')
        } else {
            let prize_count = {
                '1': 1,
                '2': 118,
                '3': 218,
                '4': 388,
                '5': 500
            }
            let count = await ctx.smart_tv_db.collection('didi_prize').count({ type: order.type })
            if (count < prize_count[order.type] || order.type != 5) {
                let update_result = await ctx.smart_tv_db.collection('didi_order').updateOne({ _id: ObjectID(order_id) }, { $set: { is_used: true } })
                let insert_result = await ctx.smart_tv_db.collection('didi_prize').insertOne({ order_id: order_id, type: order.type, ...contact })
                ctx.smart_tv_db.collection('didi_stat').insertOne({ ip: ctx.request.headers['x-real-ip'], action: 'order_contact', from: ctx.request.headers.referer, t: Date.now(), ua: ctx.request.headers['user-agent'], extra: { order, contact } })
                ctx.body = super.success()
            } else {
                ctx.body = super.error_with_message(403, '抱歉，礼品已经派送完毕，欢迎关注滴滴优享')
            }
        }
    }
    async get_js_config(ctx) {
        let js_config = await ctx.weixin_api.getJsConfig({ debug: false, jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'], url: ctx.request.headers.referer })
        ctx.smart_tv_db.collection('didi_stat').insertOne({ ip: ctx.request.headers['x-real-ip'], action: 'get_js_config', from: ctx.request.headers.referer, t: Date.now(), ua: ctx.request.headers['user-agent'] })
        ctx.body = super.success_with_result(js_config)
    }
    async get_stat(ctx) {

    }
}