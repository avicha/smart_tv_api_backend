const BaseController = require('./base')
const video_source = require('../const/video_source')
const YoukuCrawler = require('../services/crawlers/youku')

module.exports = class VideoController extends BaseController {
    async get_play_info(ctx) {
        let video_id = ctx.request.query.video_id
        let source = parseInt(ctx.request.query.source)
        switch (source) {
            case video_source.YOUKU:
                let data = await YoukuCrawler.get_play_info(video_id)
                ctx.body = super.success_with_result(data)
                break;
        }
    }
}