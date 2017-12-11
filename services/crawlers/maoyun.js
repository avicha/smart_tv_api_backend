let request = require('request')
let config = require('../../config')
let video_source = require('../../const/video_source')
let maoyun_utils = require('./maoyun_utils')

class MaoyunCrawler {
    static get_iqiyi_video_play_info(video_id) {
        return [{
            weight: 4,
            type: 'fhd',
            type_text: '蓝光',
            duration: 0,
            lang: 'default',
            lang_text: '默认',
            url: `${config.app_url}/api/video/get_play_url?video_id=${video_id}&source=${video_source.IQIYI}`
        }]
    }
    static get_video_play_url(url) {
        return new Promise((resolve, reject) => {
            request.get({ url: 'http://jx.maoyun.tv/index.php', qs: { id: url } }, (error, response, body) => {
                if (error || response.statusCode != 200) {
                    reject(error || body)
                } else {
                    let hdMd5 = /eval\((.*)\);/.test(body) ? body.match(/eval\((.*)\);/)[1] : null
                    hdMd5 = maoyun_utils.decode_xstr(hdMd5)
                    hdMd5 = /val\('(.*?)'\)/.test(hdMd5) ? hdMd5.match(/val\('(.*?)'\)/)[1] : null
                    let payload = {
                        xml: url,
                        md5: maoyun_utils.sign(hdMd5),
                        type: 'auto',
                        hd: 'cq',
                        wap: 0,
                        siteuser: '',
                        lg: '',
                        cip: 'cq',
                        iqiyicip: 'cq'
                    }
                    request.get({ uri: 'http://jx.maoyun.tv/url.php', qs: payload, headers: { Referer: `http://jx.maoyun.tv/index.php?id=${encodeURIComponent(url)}` } }, (error, response, body) => {
                        if (error || response.statusCode != 200) {
                            reject(error || new Error(body))
                        } else {
                            resolve(body.replace(/ts\.php/g, 'http://jx.maoyun.tv/ts.php'))
                        }
                    })
                }
            })
        })

    }
}
module.exports = MaoyunCrawler