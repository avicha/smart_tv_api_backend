let request = require('request')
class YoukuCrawler {
    static get_cna() {
        return new Promise((resolve, reject) => {
            request.get('http://log.mmstat.com/eg.js', (error, response, body) => {
                if (error || response.statusCode != 200) {
                    reject(error || new Error(body))
                } else {
                    resolve(JSON.parse(response.headers.etag))
                }
            })
        })
    }
    static convert_lang_text(audio_lang) {
        switch (audio_lang) {
            case 'guoyu':
                return '国语'
            default:
                return '默认'
        }
    }
    static get_ups_info(video_id, type = null) {
        return new Promise((resolve, reject) => {
            YoukuCrawler.get_cna().then(cna => {
                let payload = {
                    vid: video_id,
                    ccode: '0508',
                    client_ip: '192.168.1.1',
                    utid: cna,
                    client_ts: parseInt(Date.now() / 1000)
                }
                request.get({ uri: 'https://ups.youku.com/ups/get.json', qs: payload, json: true }, (error, response, body) => {
                    if (error || response.statusCode != 200) {
                        reject(error || new Error(body))
                    } else {
                        if (body.data && body.data.error) {
                            reject(new Error(body.data.error.note))
                        } else {
                            let stream = body.data.stream
                            let videos = stream.filter(video => {
                                return ['mp4sd', 'mp4hd', 'mp4hd2v2', 'mp4hd3v2'].includes(video.stream_type)
                            }).map(video => {
                                let video_obj = {
                                    width: video.width,
                                    height: video.height,
                                    duration: video.milliseconds_video,
                                    lang: video.audio_lang,
                                    lang_text: YoukuCrawler.convert_lang_text(video.audio_lang),
                                    url: video.m3u8_url
                                }
                                switch (video.stream_type) {
                                    case 'mp4sd':
                                        video_obj.weight = 1
                                        video_obj.type = 'sd'
                                        video_obj.type_text = '标清'
                                        break
                                    case 'mp4hd':
                                        video_obj.weight = 2
                                        video_obj.type = 'hd'
                                        video_obj.type_text = '高清'
                                    case 'mp4hd2v2':
                                        video_obj.weight = 3
                                        video_obj.type = 'shd'
                                        video_obj.type_text = '超清'
                                    case 'mp4hd3v2':
                                        video_obj.weight = 4
                                        video_obj.type = 'fhd'
                                        video_obj.type_text = '蓝光'
                                }
                                return video_obj
                            })
                            if (type) {
                                let video = videos.filter(video => {
                                    return video.type == type
                                })[0]
                                resolve(video)
                            } else {
                                resolve(videos)
                            }
                        }
                    }

                })
            }).catch(e => {
                reject(e)
            })
        })
    }
}
module.exports = YoukuCrawler