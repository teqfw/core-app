/**
 * Template for factories to create API services.
 * @interface
 */
export default class TeqFw_Core_App_Server_Handler_Api_Factory {

    constructor(spec) {
        // CONSTRUCTOR INJECTED DEPS
        /** @type {TeqFw_Core_App_Defaults} */
        const DEF = spec['TeqFw_Core_App_Defaults$'];

        // DEFINE THIS INSTANCE METHODS (NOT IN PROTOTYPE)
        /**
         * Parse input data and compose API request data object.
         * @returns {TeqFw_Core_App_Server_Handler_Api_Factory.parse}
         */
        this.createInputParser = function () {
            // DEFINE INNER FUNCTIONS
            /**
             * Parser to structure HTTP request data.
             *
             * @param {TeqFw_Core_App_Server_Http2_Context} httpCtx
             * @returns {Promise<Object>}
             * @memberOf TeqFw_Core_App_Server_Handler_Api_Factory
             * @interface
             */
            async function parse(httpCtx) {
            }

            // COMPOSE RESULT
            Object.defineProperty(parse, 'name', {
                value: `${this.constructor.name}.${parse.name}`,
            });
            return parse;
        };
        /**
         * Factory to create service (handler to process HTTP API request).
         * @returns {TeqFw_Core_App_Server_Handler_Api_Factory.service}
         */
        this.createService = function () {
            // DEFINE INNER FUNCTIONS

            /**
             * Service to handle HTTP API requests.
             *
             * @param {TeqFw_Core_App_Server_Handler_Api_Context} apiCtx
             * @returns {Promise<TeqFw_Core_App_Server_Handler_Api_Result>}
             * @memberOf TeqFw_Core_App_Server_Handler_Api_Factory
             * @interface
             */
            async function service(apiCtx) {
                // PARSE INPUT & DEFINE WORKING VARS
                // DEFINE INNER FUNCTIONS
                // MAIN FUNCTIONALITY
                // COMPOSE RESULT
            }

            // COMPOSE RESULT
            Object.defineProperty(service, 'name', {
                value: `${this.constructor.name}.${service.name}`,
            });
            return service;
        };

        /**
         * Route to the service inside this plugin namespace (see DEF.BACK_REALM).
         * @returns {String}
         */
        this.getRoute = function () {
            return DEF.API_LOAD_NS; // place relative route to DEF object
        };
    }
}