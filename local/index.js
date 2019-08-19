const Logger = require('ocbesbn-logger'); // Logger
const server = require('@opuscapita/web-init'); // Web server
const dbInit = require('@opuscapita/db-init'); // Database

const isDevMode = process.env.NODE_ENV === 'development';
const logger = new Logger();

if(!isDevMode)
    logger.redirectConsoleOut(); // Force anyone using console.* outputs into Logger format.

// Basic database and web server initialization.
// See database : https://github.com/OpusCapita/db-init
// See web server: https://github.com/OpusCapita/web-init
// See logger: https://github.com/OpusCapita/logger
async function init()
{
    const db = await dbInit.init();

    // TODO: Remove this once you have real permissions using ACL.
    if(isDevMode)
    {
        const retry = require('bluebird-retry'); // Only for development
        await retry(() => db.query('REPLACE INTO Permission (authorityId, resourceGroupId) VALUES("user", "{{your-service-name}}/*")'), { max_tries : 50 }); // Add generic wildcard permissions for the service
    }

    await server.init({
        server : {
            port : process.env.port || {{you-service-port}},
            enableBouncer : true,
            enableEventClient : true,
            events : {
                onStart: () => logger.info('Server ready. Allons-y!')
            },
            staticFilePath: __dirname + '/../src/server/static',
            indexFilePath: __dirname + '/index.html',
            indexFileRoutes: ['/'],
            webpack: {
                useWebpack: true,
                configFilePath: __dirname + '/../webpack.development.config.js'
            },
        },
        routes : {
            dbInstance : db
        }
    });
}

(() => init().catch(console.error))();
