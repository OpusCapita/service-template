'use strict';

const Logger = require('ocbesbn-logger'); // Logger
const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init'); // Database

const logger = new Logger({
    context: {
        serviceName: '{{your-service-name}}'
    }
});

logger.redirectConsoleOut(); // Force anyone using console outputs into Logger format.

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init
// See logger: https://github.com/OpusCapita/logger
db.init({
    mode: db.Mode.Dev,
    retryTimeout: 1000,
    retryCount: 10,
    consul: {
        host: 'consul'
    },
    data: {
        addTestData: true
    }
})
    .then((db) => server.init({
        server: {
            port: {{your-port}},
            mode: server.Server.Mode.Dev,
            events: {
                onStart: () => logger.info('Server ready. Allons-y!')
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
