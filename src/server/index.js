const Logger = require('ocbesbn-logger'); // Logger
const server = require('@opuscapita/web-init'); // Web server
const dbInit = require('@opuscapita/db-init'); // Database

const isDevMode = process.env.NODE_ENV === 'develop';
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

    if(isDevMode)
        await db.query('REPLACE INTO Permission (authorityId, resourceGroupId) VALUES("user", "{{your-service-name}}/*")');
    
    await server.init({
        server : {
            port : process.env.port || {{your-port}},
            enableBouncer : true,
            enableEventClient : true,
            events : {
                onStart: () => logger.info('Server ready. Allons-y!')
            }
        },
        routes : {
            dbInstance : db
        }
    });
}

(() => init().catch(console.error))();
