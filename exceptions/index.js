module.exports = {
    init_app(app) {
        app.use(async function(ctx, next) {
            try {
                await next();
            } catch (err) {
                ctx.body = {
                    'errcode': err.errcode || 500,
                    'errmsg': err.errmsg || err.message
                }
                ctx.app.emit('error', err)
            }
        })
        app.on('error', e => {
            console.error(`app occurs error: ${e.stack}`)
        })
    }
}