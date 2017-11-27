const BaseController = require('./base')

module.exports = class UserController extends BaseController {
    status(ctx) {
        let result = {
            '_id': 1,
            'username': 'Avicha',
            'avatar': 'https://wwc.alicdn.com/avatar/getAvatar.do?userNick=%E6%87%92%E6%83%B0%E7%9A%84%E6%83%85%E5%9C%A3&width=50&height=50&type=sns&_input_charset=UTF-8'
        }
        ctx.body = super.success_with_result(result)
    }
}