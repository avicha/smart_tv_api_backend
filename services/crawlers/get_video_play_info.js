let browser = require("webpage").create()
browser.captureContent = [/text\/plain/, /application\/json/, /application\/vnd\.apple\.mpegurl/]
browser.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'

let crawler_server = require("webserver").create()
let timeout = 10000
let get_query = (qs) => {
    let query = {}
    qs.split('&').forEach(tmp => {
        tmp = tmp.split('=')
        query[tmp[0]] = tmp[1]
    })
    return query
}
crawler_server.listen(9000, (req, res) => {
    console.log(req.url)
    if (req.method == 'GET') {
        let is_send = false,
            body
        let tick = setTimeout(() => {
            if (!is_send) {
                is_send = true
                res.statusCode = 200
                res.setEncoding('UTF-8')
                res.setHeader('Content-Type', 'application/json;charset=UTF-8')
                res.write(JSON.stringify({ errcode: 504, errmsg: 'request timeout.' }))
                res.close()
                browser.close()
                browser.onResourceReceived = null
            }
        }, timeout)
        let req_query = get_query(req.queryString)
        switch (req.path) {
            case '/api/video/get_play_info':
                let album_id = req_query.album_id
                let video_id = req_query.video_id
                let source = req_query.source
                let type = req_query.type || 'fhd'
                switch (source) {
                    case '1':
                        browser.onResourceReceived = function(resource) {
                            if (~resource.url.indexOf('psid') && ~resource.url.indexOf('vkey') && resource.stage == 'end') {
                                if (!is_send) {
                                    is_send = true
                                    res.statusCode = 200
                                    res.setEncoding('UTF-8')
                                    res.setHeader('Content-Type', 'application/json; charset=UTF-8')
                                    let resource_query = get_query(resource.url.split('?')[1])
                                    let video_list = [{
                                        'type': 'sd',
                                        'text': '标清(270p)',
                                        'url': `http://pl-ali.youku.com/playlist/m3u8?vid=${resource_query.vid}&type=flv&ups_client_netip=${resource_query.ups_client_netip}&ups_ts=${resource_query.ups_ts}&utid=${resource_query.utid}&ccode=${resource_query.ccode}&psid=${resource_query.psid}&expire=${resource_query.expire}&ups_key=${resource_query.vkey}`
                                    }, {
                                        'type': 'hd',
                                        'text': '高清(480p)',
                                        'url': `http://pl-ali.youku.com/playlist/m3u8?vid=${resource_query.vid}&type=mp4&ups_client_netip=${resource_query.ups_client_netip}&ups_ts=${resource_query.ups_ts}&utid=${resource_query.utid}&ccode=${resource_query.ccode}&psid=${resource_query.psid}&expire=${resource_query.expire}&ups_key=${resource_query.vkey}`
                                    }, {
                                        'type': 'shd',
                                        'text': '超清(720P)',
                                        'url': `http://pl-ali.youku.com/playlist/m3u8?vid=${resource_query.vid}&type=hd2&ups_client_netip=${resource_query.ups_client_netip}&ups_ts=${resource_query.ups_ts}&utid=${resource_query.utid}&ccode=${resource_query.ccode}&psid=${resource_query.psid}&expire=${resource_query.expire}&ups_key=${resource_query.vkey}`
                                    }, {
                                        'type': 'fhd',
                                        'text': '蓝光(1080p)',
                                        'url': `http://pl-ali.youku.com/playlist/m3u8?vid=${resource_query.vid}&type=hd3&ups_client_netip=${resource_query.ups_client_netip}&ups_ts=${resource_query.ups_ts}&utid=${resource_query.utid}&ccode=${resource_query.ccode}&psid=${resource_query.psid}&expire=${resource_query.expire}&ups_key=${resource_query.vkey}`
                                    }]
                                    res.write(JSON.stringify({
                                        errcode: 0,
                                        result: video_list.filter(video => { return video.type == type })[0]
                                    }))
                                    res.close()
                                }
                                browser.close()
                                browser.onResourceReceived = null
                            }
                        }
                        browser.open(`http://v.youku.com/v_show/id_${video_id}.html`)
                        break
                    case '2':
                        if (req_query.return == 'm3u8') {
                            browser.onResourceReceived = function(resource) {
                                if (~resource.url.indexOf('http://jx.maoyun.tv/url.php?xml=') && resource.stage == 'end') {
                                    if (!is_send) {
                                        is_send = true
                                        res.statusCode = 200
                                        res.setEncoding('UTF-8')
                                        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=UTF-8')
                                        res.write(resource.body)
                                        res.close()
                                        browser.close()
                                        browser.onResourceReceived = null
                                    }
                                }
                            }
                            browser.open(`http://jx.maoyun.tv/index.php?id=https://v.qq.com/x/cover/${album_id}/${video_id}.html`)
                        } else {
                            res.statusCode = 200
                            res.setEncoding('UTF-8')
                            res.setHeader('Content-Type', 'application/json; charset=UTF-8')
                            body = JSON.stringify({
                                errcode: 0,
                                result: {
                                    type: 'shd',
                                    text: '超清(720P)',
                                    url: `http://119.23.127.94${req.url}&return=m3u8`
                                }

                            })
                            res.write(body)
                            res.close()
                            browser.close()
                            browser.onResourceReceived = null
                        }
                        break
                    case '3':
                        if (req_query.return == 'm3u8') {
                            browser.onResourceReceived = function(resource) {
                                if (~resource.url.indexOf('http://jx.maoyun.tv/url.php?xml=') && resource.stage == 'end') {
                                    if (!is_send) {
                                        is_send = true
                                        res.statusCode = 200
                                        res.setEncoding('UTF-8')
                                        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=UTF-8')
                                        body = resource.body.replace(/ts\.php/g, () => {
                                            return 'http://jx.maoyun.tv/ts.php'
                                        })
                                        res.write(body)
                                        res.close()
                                        browser.close()
                                        browser.onResourceReceived = null
                                    }
                                }
                            }
                            browser.open(`http://jx.maoyun.tv/index.php?id=http://www.iqiyi.com/${video_id}.html`)
                        } else {
                            res.statusCode = 200
                            res.setEncoding('UTF-8')
                            res.setHeader('Content-Type', 'application/json; charset=UTF-8')
                            body = JSON.stringify({
                                errcode: 0,
                                result: {
                                    previous: null,
                                    next: null,
                                    list: [{
                                        type: 'shd',
                                        text: '超清(720P)',
                                        url: `http://119.23.127.94${req.url}&return=m3u8`
                                    }]
                                }
                            })
                            res.write(body)
                            res.close()
                            browser.close()
                            browser.onResourceReceived = null
                        }
                        break
                }
                break
        }
    }
})