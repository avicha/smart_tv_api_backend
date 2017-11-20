const BaseController = require('./base')

module.exports = class CommonController extends BaseController {
    now(ctx) {
        let result = Date.now()
        ctx.body = super.success_with_result(result)
    }
    weather(ctx) {
        let result = {
            'weather': '晴',
            'temperature': 32
        }
        ctx.body = super.success_with_result(result)
    }
}