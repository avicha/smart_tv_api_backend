const Router = require('koa-router')
const commonController = new(require('./common'))()
const userController = new(require('./user'))()
const categoryController = new(require('./category'))()
const tvController = new(require('./tv'))()
const videoController = new(require('./video'))()

module.exports = {
    init_app(app) {
        const commonRouter = new Router({
            prefix: '/api/common'
        })
        commonRouter.get('/now', commonController.now)
        commonRouter.get('/weather', commonController.weather)
        app.use(commonRouter.routes())

        const userRouter = new Router({
            prefix: '/api/user'
        })
        userRouter.get('/status', userController.status)
        app.use(userRouter.routes())

        const categoryRouter = new Router({
            prefix: '/api/category'
        })
        // categoryRouter.get('/create', categoryController.create)
        categoryRouter.get('/list', categoryController.list)
        app.use(categoryRouter.routes())

        const tvRouter = new Router({
            prefix: '/api/tv'
        })
        tvRouter.get('/get_search_options', tvController.get_search_options)
        tvRouter.get('/search', tvController.search)
        tvRouter.get('/get_detail', tvController.get_detail)
        tvRouter.get('/get_parts', tvController.get_parts)
        app.use(tvRouter.routes())

        const videoRouter = new Router({
            prefix: '/api/video'
        })
        videoRouter.get('/get_play_info', videoController.get_play_info)
        app.use(videoRouter.routes())
    }
}