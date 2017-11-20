let MongoClient = require('mongodb').MongoClient

module.exports = {
    getDB(db, db_config) {
        let url = `mongodb://${db_config.connection_url}/${db}`
        return MongoClient.connect(url, db_config.options)
    }
}