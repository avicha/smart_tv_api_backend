const BaseController = require('./base')
const ObjectID = require('mongodb').ObjectID

module.exports = class TVController extends BaseController {
    get_search_options(ctx) {
        let result = [{
            'key': 'type',
            'text': '类型',
            'type': 'radio',
            'values': [{
                'text': '不限',
                'value': '-1'
            }, {
                'text': '剧情',
                'value': '11'
            }, {
                'text': '青春',
                'value': '13'
            }, {
                'text': '都市',
                'value': '18'
            }, {
                'text': '玄幻',
                'value': '21'
            }, {
                'text': '历史',
                'value': '20'
            }, {
                'text': '悬疑',
                'value': '15'
            }, {
                'text': '战争',
                'value': '19'
            }, {
                'text': '武侠',
                'value': '22'
            }, {
                'text': '科幻',
                'value': '16'
            }, {
                'text': '喜剧',
                'value': '17'
            }, {
                'text': '网剧',
                'value': '14'
            }, {
                'text': '原创',
                'value': '12'
            }, {
                'text': '儿童',
                'value': '23'
            }, {
                'text': '其他',
                'value': '24'
            }]
        }, {
            'key': 'region',
            'text': '地区',
            'type': 'radio',
            'values': [{
                'text': '不限',
                'value': '-1'
            }, {
                'text': '内地',
                'value': '100'
            }, {
                'text': '香港',
                'value': '101'
            }, {
                'text': '台湾',
                'value': '102'
            }, {
                'text': '韩国',
                'value': '105'
            }, {
                'text': '美国',
                'value': '103'
            }, {
                'text': '日本',
                'value': '106'
            }, {
                'text': '英国',
                'value': '104'
            }, {
                'text': '其他',
                'value': '107'
            }]
        }, {
            'key': 'years',
            'text': '年份',
            'type': 'radio',
            'values': [{
                'text': '不限',
                'value': ''
            }, {
                'text': '2017',
                'value': '2017'
            }, {
                'text': '2016',
                'value': '2016'
            }, {
                'text': '2015',
                'value': '2015'
            }, {
                'text': '2014',
                'value': '2014'
            }, {
                'text': '2013',
                'value': '2013'
            }, {
                'text': '2012',
                'value': '2012'
            }, {
                'text': '2011',
                'value': '2011'
            }, {
                'text': '2010',
                'value': '2010'
            }, {
                'text': '2000-2009',
                'value': '2000-2009'
            }, {
                'text': '90年代',
                'value': '1990-1999'
            }, {
                'text': '其他',
                'value': '-1989'
            }]
        }, {
            'key': 'is_vip',
            'text': '资费',
            'type': 'radio',
            'values': [{
                'text': '不限',
                'value': '-1'
            }, {
                'text': '免费',
                'value': '0'
            }, {
                'text': 'VIP',
                'value': '1'
            }]
        }, {
            'key': 'sort',
            'text': '排序',
            'type': 'radio',
            'values': [{
                'text': '最新',
                'value': 'new'
            }, {
                'text': '最热',
                'value': 'hot'
            }]
        }]
        ctx.body = super.success_with_result(result)
    }
    async search(ctx) {
        let keywords = ctx.request.query.keywords
        let type = ctx.request.query.type
        let years = ctx.request.query.years || ''
        let is_vip = ctx.request.query.is_vip
        let region = ctx.request.query.region
        let page = parseInt(ctx.request.query.page || 1)
        let rows = parseInt(ctx.request.query.rows || 24)
        let sort = ctx.request.query.sort || 'new'
        let query = { 'category': 'tv' }
        let resource_query = { 'status': { '$not': { '$eq': -1 } } }
        let fields_arr = ['_id', 'name', 'resources.id', 'resources.source', 'resources.folder', 'resources.actors', 'resources.is_vip', 'resources.status']
        let fields = {}
        fields_arr.forEach(key => { fields[key] = 1 })
        let query_tags = []
        if (keywords) {
            query.name = { '$regex': keywords }
        }
        if (type && ~type) {
            query_tags.push(parseInt(type))
        }
        if (region && ~region) {
            query_tags.push(parseInt(region))
        }
        if (query_tags.length) {
            query.tags = { '$all': query_tags }
        }
        is_vip == '0' ? (resource_query.is_vip = false) : (is_vip == '1' ? (resource_query.is_vip = true) : null)
        if (years) {
            let start_time, end_time
            if (/^\d{4}$/.test(years)) {
                start_time = years + '-01-01'
                end_time = years + '-12-31'
                resource_query.publish_date = { '$gte': start_time, '$lte': end_time }
            }
            if (/^-\d{4}$/.test(years)) {
                end_time = years.substring(1) + '-12-31'
                resource_query['$or'] = [{ 'publish_date': { '$lte': end_time } }, { 'publish_date': { '$eq': null } }]
            }
            if (/^\d{4}-$/.test(years)) {
                start_time = years.substring(0, 4) + '-01-01'
                resource_query['$or'] = [{ 'publish_date': { '$gte': start_time } }, { 'publish_date': { '$eq': null } }]
            }
            if (/^\d{4}-\d{4}$/.test(years)) {
                start_time = years.match(/^(\d{4})-\d{4}$/)[1] + '-01-01'
                end_time = years.match(/^\d{4}-(\d{4})$/)[1] + '-12-31'
                resource_query.publish_date = { '$gte': start_time, '$lte': end_time }
            }
        }
        query.resources = { '$elemMatch': resource_query }
        let sorts
        if (sort == 'hot') {
            sorts = { 'resources.play_count': -1, 'resources.created_at': 1 }
        } else {
            sorts = { 'resources.publish_date': -1, 'resources.created_at': 1 }
        }
        let total_rows = await ctx.smart_tv_db.collection('videos').count(query)
        let result = await ctx.smart_tv_db.collection('videos').find(query, fields, { skip: (page - 1) * rows, limit: rows, sort: sorts }).toArray()
        console.log(query, total_rows)
        ctx.body = super.success_with_list_result(total_rows, result)
    }
    async get_detail(ctx) {
        let id = ctx.request.query.id
        let fields = {}
        let fields_arr = ['_id', 'name', 'resources.id', 'resources.source', 'resources.status', 'resources.current_part', 'resources.part_count', 'resources.director', 'resources.alias', 'resources.types', 'resources.desc', 'resources.actors_detail', 'resources.actors', 'resources.update_notify_desc', 'resources.score', 'resources.publish_date', 'resources.folder', 'resources.region', 'resources.is_vip']
        fields_arr.forEach(key => { fields[key] = 1 })
        let result = await ctx.smart_tv_db.collection('videos').findOne({ _id: ObjectID(id) }, fields)
        ctx.body = super.success_with_result(result)
    }
    async get_parts(ctx) {
        let id = ctx.request.query.id
        let source = ctx.request.query.source
        let query = { 'id': id, 'source': parseInt(source) }
        let video_parts = await ctx.smart_tv_db.collection('video_parts').findOne(query)
        let videos = video_parts.parts
        videos.forEach(video => {
            video.id = id
            video.source = source
        })
        ctx.body = super.success_with_list_result(videos.length, videos)
    }
}