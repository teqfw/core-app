import $fs from 'fs';
import $mimeTypes from 'mime-types';
import $path from 'path';
import {constants as H2} from 'http2';

/**
 * Factory to create handler for static files.
 *
 * @implements {TeqFw_Core_App_Server_Http2_Handler_Factory}
 */
export default class TeqFw_Core_App_Server_Http2_Handler_Static {

    constructor(spec) {
        /** @type {TeqFw_Core_App_Defaults} */
        const DEF = spec['TeqFw_Core_App_Defaults$'];
        /** @type {TeqFw_Di_Container} */
        const container = spec[DEF.DI_CONTAINER];   // named singleton
        /** @type {TeqFw_Core_App_Config} */
        const config = spec['TeqFw_Core_App_Config$'];  // instance singleton
        /** @type {TeqFw_Core_App_Logger} */
        const logger = spec['TeqFw_Core_App_Logger$'];  // instance singleton
        /** @type {TeqFw_Core_App_Plugin_Registry} */
        const registry = spec['TeqFw_Core_App_Plugin_Registry$'];   // instance singleton
        /** @type {typeof TeqFw_Core_App_Server_Http2_Stream_Report} */
        const Report = spec['TeqFw_Core_App_Server_Http2_Stream#Report'];   // class constructor

        /**
         * @returns {Promise<TeqFw_Core_App_Server_Http2_Handler_Static.handler>}
         */
        this.createHandler = async function () {
            // PARSE INPUT & DEFINE WORKING VARS
            const rootFs = config.get('/path/root');    // path to project root
            const rootWeb = $path.join(rootFs, DEF.FS_WEB);    // default path to app web root
            const mapRoutes = {};   // '/src/@teqfw/core-app' => '/.../node_modules/@teqfw/core-app/src'

            // DEFINE INNER FUNCTIONS
            /**
             * Handler to process static files.
             *
             * @param {TeqFw_Core_App_Server_Http2_Stream_Context} context
             * @returns {Promise<TeqFw_Core_App_Server_Http2_Stream_Report>}
             * @memberOf TeqFw_Core_App_Server_Http2_Handler_Static
             * @implements {TeqFw_Core_App_Server_Http2_Stream.handler}
             */
            async function handler(context) {
                // DEFINE INNER FUNCTIONS
                /**
                 * Compose absolute path to requested resource:
                 *  - /src/vue/vue.global.js => /.../node_modules/vue/dist/vue.global.js
                 *  - /web/@flancer32/teqfw-app-sample/favicon.ico => /.../@flancer32/teqfw-app-sample/web/favicon.ico
                 *  - /index.html => /.../web/index.html
                 *
                 * @param {String} url
                 * @returns {String}
                 */
                function getPath(url) {

                    // DEFINE INNER FUNCTIONS
                    function pathMap(url) {
                        let result = url;
                        for (const key in mapRoutes) {
                            const one = mapRoutes[key];
                            const regSrc = new RegExp(`(.*)(${key})(.*)`);
                            const partsSrc = regSrc.exec(url);
                            if (Array.isArray(partsSrc)) {
                                const tail = partsSrc[3];
                                result = `${one}/${tail}`;
                                result = result.replace(/\/\//g, '/');
                                break;
                            }
                        }
                        return result;
                    }

                    // MAIN FUNCTIONALITY
                    let result;
                    const normal = (url === '/') ? '/index.html' : url;
                    const mapped = pathMap(normal);
                    if (normal === mapped) {   // URL w/o mapping should be resolved relative to web root
                        result = $path.join(rootWeb, normal);
                    } else {    // URL w mapping should be resolved relative to project root
                        result = mapped;
                    }
                    return result;
                }

                // MAIN FUNCTIONALITY
                const result = new Report();
                /** @type {Object<String, String>} */
                const headers = context.headers;
                const url = headers[H2.HTTP2_HEADER_PATH];
                const path = getPath(url);
                if ($fs.existsSync(path) && $fs.statSync(path).isFile()) {
                    const mimeType = $mimeTypes.lookup(path);
                    if (mimeType) {
                        result.headers[H2.HTTP2_HEADER_STATUS] = H2.HTTP_STATUS_OK;
                        result.headers[H2.HTTP2_HEADER_CONTENT_TYPE] = mimeType;
                        result.filepath = path;
                        result.complete = true;
                    }
                }
                return result;
            }

            // MAIN FUNCTIONALITY
            // compose static routes map for plugins
            logger.debug('Map plugins folders for static resources:');
            const items = registry.items();
            for (const item of items) {
                // map URLs to filesystem for ES6/JS sources
                const srcUrl = $path.join('/', DEF.REALM_SRC, item.name);
                const srcPath = $path.join(item.path, DEF.FS_SRC);
                mapRoutes[srcUrl] = srcPath;
                logger.debug(`    ${srcUrl} => ${srcPath}`);
                // map URLs to filesystem for static resources
                const statUrl = $path.join('/', DEF.REALM_WEB, item.name);
                const statPath = $path.join(item.path, DEF.FS_WEB);
                mapRoutes[statUrl] = statPath;
                logger.debug(`    ${statUrl} => ${statPath}`);
                // map additional resources
                if (item.initClass) {
                    /** @type {TeqFw_Core_App_Plugin_Init} */
                    const plugin = await container.get(item.initClass, this.constructor.name);
                    if (plugin && (typeof plugin.getHttp2StaticMaps === 'function')) {
                        const map = plugin.getHttp2StaticMaps();
                        for (const key in map) {
                            const url = $path.join('/', DEF.REALM_SRC, key);
                            const path = $path.join(rootFs, 'node_modules', map[key]);
                            mapRoutes[url] = path;
                            logger.debug(`    ${url} => ${path}`);
                        }
                    }
                }
            }

            // COMPOSE RESULT
            Object.defineProperty(handler, 'name', {value: `${this.constructor.name}.${handler.name}`});
            return handler;
        };
    }

}