module.exports = {
    server: {
        port: 8888,
        secret_key: 'fG0HASkgAqR4jQGAFlnWFXtwATi89EAw'
    },
    mongodb: {
        connection_url: '119.23.127.94:27017',
        options: {
            appname: 'smart_tv',
            poolSize: 4,
            autoReconnect: true
        }
    }
}