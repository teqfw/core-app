import $knex from 'knex';

/**
 * 'knex' based connector to relational database.
 */
export default class TeqFw_Core_App_Db_Connector {

    constructor(spec) {
        /** @type {TeqFw_Core_App_Config} */
        const config = spec['TeqFw_Core_App_Config$'];
        /** @type {TeqFw_Core_App_Logger} */
        const logger = spec['TeqFw_Core_App_Logger$'];

        let knex;

        /**
         * Initialize connection to 'main' database.
         *
         * @returns {Promise<void>}
         */
        this.init = async function () {
            const dbSpec = config.get('/local/db/main');
            const db = dbSpec.connection.database + '@' + dbSpec.connection.host;
            const user = dbSpec.connection.user;
            try {
                knex = await $knex(dbSpec);
                logger.info('Connected to DB \'' + db + '\' as \'' + user + '\'.');
            } catch (e) {
                logger.error('Cannot connect to DB \'' + db + '\' as \'' + user + '\'. Error: ' + e);
            }
        };


        /**
         * Start new knex transaction.
         *
         * @returns {Promise<*>}
         */
        this.startTransaction = async function () {
            if (!knex) await this.init();
            return await knex.transaction();
        };

        /**
         * Accessor for 'knex' object.
         *
         * @returns {*}
         */
        this.getKnex = async function () {
            if (!knex) await this.init();
            return knex;
        };

        /**
         * Accessor for 'knex.schema' object.
         * (empty array is returned for async function)
         * @returns {SchemaBuilder}
         */
        this.getSchema = function () {
            return knex.schema;
        };

        this.disconnect = async function () {
            if (!knex) await this.init();
            const pool = knex.client.pool;
            return new Promise(function (resolve) {
                const WAIT = 100;

                /**
                 * Check DB connections in loop and close all when all connections will be released.
                 */
                function checkPool() {
                    const acquires = pool.numPendingAcquires();
                    const creates = pool.numPendingCreates();
                    const pending = acquires + creates;
                    if (pending > 0) {
                        // wait until all connections will be released
                        setTimeout(checkPool, WAIT);
                    } else {
                        // close all connections
                        knex.destroy();
                        logger.info('All database connections are closed.');
                        resolve();
                    }
                }

                setTimeout(checkPool, WAIT);
            });

        };
    }
}
