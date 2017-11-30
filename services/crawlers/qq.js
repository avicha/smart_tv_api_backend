const request = require('request')
const qs = require('querystring')
const path = require('path')

let $xx = function(a, b, d, e, f, g) {
    let magic = "123456"
    if (g.length < 3)
        return "err";
    if ("7." != g.substr(0, 2))
        return "err";
    let subver = g.substr(2)
    subver == "1" && (magic = "06fc1464")
    subver == "2" && (magic = "4244ce1b")
    subver == "3" && (magic = "77de31c5")
    subver == "4" && (magic = "e0149fa2")
    subver == "5" && (magic = "60394ced")
    subver == "6" && (magic = "2da639f0")
    subver == "7" && (magic = "c2f0cf9f")
    f = f || parseInt(+new Date / 1e3)
    e = ("" + e).charAt(0)
    h = $ha(magic + b + f + "*#06#" + a)
    return h
}
let $ha = function(a) {
    function b(a, b) {
        return ((a >> 1) + (b >> 1) << 1) + (1 & a) + (1 & b)
    }
    let c = [],
        d = 0
    for (; d < 64;)
        c[d] = 0 | 4294967296 * Math.abs(Math.sin(++d))
    let e = function(d) {
        let e, f, g, h, i = [],
            j = unescape(encodeURI(d)),
            k = j.length,
            l = [e = 1732584193, f = -271733879, ~e, ~f],
            m = 0
        for (; m <= k;)
            i[m >> 2] |= (j.charCodeAt(m) || 128) << 8 * (m++ % 4)
        for (i[d = (k + 8 >> 6) * a + 14] = 8 * k,
            m = 0; m < d; m += a) {
            for (k = l,
                h = 0; h < 64;)
                k = [g = k[3], b(e = k[1], (g = b(b(k[0], [e & (f = k[2]) | ~e & g, g & e | ~g & f, e ^ f ^ g, f ^ (e | ~g)][k = h >> 4]), b(c[h], i[[h, 5 * h + 1, 3 * h + 5, 7 * h][k] % a + m]))) << (k = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, a, 23, 6, 10, 15, 21][4 * k + h++ % 4]) | g >>> 32 - k), e, f];
            for (h = 4; h;)
                l[--h] = b(l[h], k[h])
        }
        for (d = ""; h < 32;)
            d += (l[h >> 3] >> 4 * (1 ^ 7 & h++) & 15).toString(a)
        return d
    }
    return e
}(16)
class QQCrawler {
    static _set_ckey(vinfoparam) {
        let day = new Date().getDay()
        vinfoparam.encryptVer = "7." + (0 == day ? 7 : day)
        vinfoparam.cKey = $xx(vinfoparam.platform, vinfoparam.vid, vinfoparam.sdtfrom, 1, vinfoparam.tm, vinfoparam.encryptVer)
    }
    static proxyhttp(album_id, video_id, type = 'shd') {
        return new Promise((resolve, reject) => {
            let url = `https://v.qq.com/x/cover/${album_id}.html`
            let vinfoparam = {
                charge: 0,
                defaultfmt: 'auto',
                otype: 'ojson',
                platform: '10901',
                sdtfrom: 'v1010',
                defnpayver: 1,
                appVer: '3.4.34',
                host: 'v.qq.com',
                refer: url,
                ehost: url,
                sphttps: 1,
                tm: parseInt(Date.now() / 1000),
                spwm: 4,
                vid: video_id,
                defn: type,
                fhdswitch: 1,
                show1080p: 1,
                isHLS: 1,
                onlyGetinfo: true,
                dtype: 3,
                sphls: 1,
                defsrc: 2
            }
            QQCrawler._set_ckey(vinfoparam)
            let payload = {
                buid: "onlyvinfo",
                vinfoparam: qs.stringify(vinfoparam)
            }
            let headers = {
                'referer': url,
                'content-type': 'text/plain',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
                'cookie': 'uin=o0278357066; skey=@PYV0DiRxY;'
            }
            request.post({ uri: 'https://vd.l.qq.com/proxyhttp', body: payload, headers: headers, json: true }, (error, response, body) => {
                if (error && response.statusCode != 200) {
                    reject(error || new Error(body))
                } else {
                    if (body.errCode) {
                        reject(new Error(body))
                    } else {
                        try {
                            if (body.vinfo) {
                                body.vinfo = JSON.parse(body.vinfo)
                                if (body.vinfo.msg) {
                                    reject(new Error(body.vinfo.msg))
                                } else {
                                    let vi = body.vinfo.vl.vi[0]
                                    let video_play_info = {
                                        type: type,
                                        width: vi.vw,
                                        height: vi.vh,
                                        lang: ~vi.ti.indexOf('粤语') ? 'yueyu' : (~vi.ti.indexOf('国语') ? 'guoyu' : 'default'),
                                        lang_text: ~vi.ti.indexOf('粤语') ? '粤语' : (~vi.ti.indexOf('国语') ? '国语' : '默认'),
                                        url: vi.ul.ui[0].url + vi.ul.ui[0].hls.pt
                                    }
                                    switch (type) {
                                        case 'sd':
                                            video_play_info.type_text = '标清'
                                            video_play_info.weight = 1
                                            break
                                        case 'hd':
                                            video_play_info.type_text = '高清'
                                            video_play_info.weight = 2
                                            break
                                        case 'shd':
                                            video_play_info.type_text = '超清'
                                            video_play_info.weight = 3
                                            break
                                        case 'fhd':
                                            video_play_info.type_text = '蓝光'
                                            video_play_info.weight = 4
                                            break
                                    }
                                    resolve(video_play_info)
                                }
                            } else {
                                reject(new Error(body))
                            }
                        } catch (e) {
                            reject(e)
                        }
                    }
                }

            })
        })
    }
    static crawl_video_url(video) {
        let url = video.url
        return new Promise((resolve, reject) => {
            request.get({ uri: url }, (error, response, body) => {
                if (error && response.statusCode != 200) {
                    reject(error || new Error(body))
                } else {
                    let dirname = path.dirname(url)
                    body = body.replace(/(.*)ver=4/g, (match) => {
                        return `${dirname}/${match}`
                    })
                    resolve(body)
                }
            })
        })
    }
    static get_video_info(video_id) {
        return new Promise((resolve, reject) => {
            let payload = {
                otype: "json",
                platform: "10904",
                appVer: "1.2.1",
                vid: video_id,
                defn: 'fhd',
                dtype: 3,
                sdtfrom: 'v1098',
                sphls: 2
            }
            QQCrawler._set_ckey(payload)
            request.post({ uri: 'http://vv.video.qq.com/getvinfo', body: qs.stringify(payload) }, (error, response, body) => {
                console.log(body)
                resolve(body)
            })
        })
    }
}
module.exports = QQCrawler