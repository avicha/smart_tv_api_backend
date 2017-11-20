module.exports = {
    server: {
        port: 80,
        secret_key: ''
    },
    mongodb: {
        connection_url: '127.0.0.1:27017',
        options: {
            appname: 'smart_tv',
            poolSize: 4,
            autoReconnect: true
        }
    }
}