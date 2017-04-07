'use strict';

const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init'); // Database
const Logger = require('ocbesbn-logger'); // Logger

var logger = new Logger({
    context: {
        serviceName: '{{your-service-name}}'
    }
});

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init
// See logger: https://github.com/OpusCapita/logger
db.init({
    mode: db.Mode.Dev,
    consul: {
        host: 'consul'
    },
    data: {
        addTestData: true
    }
})
.then((db) => server.init({
    server: {
        mode: server.Server.Mode.Dev,
        events : {
            onStart : () => logger.info('Server ready. Allons-y!')
        }
    },
    routes: {
        dbInstance: db
    }
}))
.catch((e) => {
    server.end();
    throw e;
});
