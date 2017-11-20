const BaseController = require('./base')

module.exports = class UserController extends BaseController {
    status(ctx) {
        let result = {
            'id': 1,
            'username': 'Avicha',
            'avatar': 'https://avatars1.githubusercontent.com/u/1276962'
        }
        ctx.body = super.success_with_result(result)
    }
}