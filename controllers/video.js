const BaseController = require('./base')
const config = require('../config')
const video_source = require('../const/video_source')
const YoukuCrawler = require('../services/crawlers/youku')
const QQCrawler = require('../services/crawlers/qq')
const MaoyunCrawler = require('../services/crawlers/maoyun')

module.exports = class VideoController extends BaseController {
    async get_play_info(ctx) {
        let video_id = ctx.request.query.video_id
        let album_id = ctx.request.query.album_id
        let source = parseInt(ctx.request.query.source)
        let videos = []
        switch (source) {
            case video_source.YOUKU:
                videos = await YoukuCrawler.get_ups_info(video_id)
                break
            case video_source.QQ:
                let types = ['sd', 'hd', 'shd', 'fhd']
                let promises = types.map(type => {
                    return QQCrawler.proxyhttp(album_id, video_id, type).catch(e => {})
                })
                for (let promise of promises) {
                    let video = await promise
                    if (video) {
                        video.url = `${config.app_url}/api/video/get_play_url?video_id=${video_id}&album_id=${album_id}&source=${source}&type=${video.type}`
                        videos.push(video)
                    }
                }
                break
            case video_source.IQIYI:
                videos = MaoyunCrawler.get_iqiyi_video_play_info(video_id)
                break
        }
        videos.sort((a, b) => {
            return b.weight - a.weight
        })
        ctx.body = super.success_with_result(videos)
    }

    async get_play_url(ctx) {
        let video_id = ctx.request.query.video_id
        let album_id = ctx.request.query.album_id
        let source = parseInt(ctx.request.query.source)
        let type = ctx.request.query.type
        let body = ''
        switch (source) {
            case video_source.IQIYI:
                body = await MaoyunCrawler.get_video_play_url(`http://www.iqiyi.com/${video_id}.html`)
                break
            case video_source.QQ:
                let video = await QQCrawler.proxyhttp(album_id, video_id, type).catch(e => {})
                if (video) {
                    body = await QQCrawler.crawl_video_url(video)
                }
                break
        }
        ctx.body = body
        ctx.set({
            'Content-Type': 'application/vnd.apple.mpegurl; charset=UTF-8'
        })
    }
}