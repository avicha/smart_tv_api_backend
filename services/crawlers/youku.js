const request = require('request')
const video_source = require('../../const/video_source')
if (process.NODE_ENV == 'development') {
    request.debug = true
}
module.exports = class YoukuCrawler {
    static async get_cna() {
        return new Promise((resolve, reject) => {
            let j = request.jar()
            request.get({ url: 'http://log.mmstat.com/eg.js', jar: j }, (error, response, body) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(JSON.parse(response.headers.etag))
                }
            })
        })
    }

    static async get_ups(video_id, cna) {
        let payload = {
            'vid': video_id,
            'ccode': '0501',
            'client_ip': '0.0.0.0',
            'client_ts': parseInt(Date.now() / 1000),
            'utid': 'HLwAEYVFXmECAXFcg5HlXZrB'
        }
        let headers = {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'referer': `http://m.youku.com/video/id_${video_id}.html`
        }
        return new Promise((resolve, reject) => {
            request.get({ uri: 'https://ups.youku.com/ups/get.json', headers: headers, qs: payload }, (error, response, body) => {
                if (error) {
                    reject(error)
                } else {
                    let resp = JSON.parse(body)
                    let data = resp.data
                    if (data.error) {
                        reject({ errcode: data.error.code, errmsg: data.error.note })
                    } else {
                        resolve(data)
                    }
                }
            })
        })
    }
    static async get_play_info(video_id) {
        let cna = await YoukuCrawler.get_cna()
        let ups = await YoukuCrawler.get_ups(video_id, cna)
        let play_info = {}
        play_info.playlist = ups.stream.map(x => {
            return {
                'width': x.width,
                'height': x.height,
                'url': x.m3u8_url,
                'type': x.stream_type,
                'lang': x.audio_lang,
                'duration': x.milliseconds_video
            }
        }).filter(x => { return ['mp4sd', 'mp4hd', 'mp4hd2'].includes(x.type) })
        let next_part = ups.videos.next
        let previous_part = ups.videos.previous
        play_info.next = next_part ? { 'video_id': next_part.encodevid, 'source': video_source.YOUKU } : null
        play_info.previous = previous_part ? { 'video_id': previous_part.encodevid, 'source': video_source.YOUKU } : null
        return play_info
    }
}