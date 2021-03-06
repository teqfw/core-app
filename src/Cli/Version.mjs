/**
 * @namespace TeqFw_Core_App_Cli_Version
 */
// DEFINE WORKING VARS
const NS = 'TeqFw_Core_App_Cli_Version';

// DEFINE MODULE'S FUNCTIONS
/**
 * Factory to create CLI command to get application version.
 *
 * @param {TeqFw_Di_SpecProxy} spec
 * @returns {TeqFw_Core_App_Cli_Command_Data}
 * @constructor
 * @memberOf TeqFw_Core_App_Cli_Version
 */
function Factory(spec) {
    // PARSE INPUT & DEFINE WORKING VARS
    /** @type {TeqFw_Core_App_Defaults} */
    const DEF = spec['TeqFw_Core_App_Defaults$'];   // instance singleton
    /** @type {TeqFw_Core_App_Launcher.Bootstrap} */
    const bootCfg = spec[DEF.DI_BOOTSTRAP]; // named singleton
    /** @type {typeof TeqFw_Core_App_Cli_Command_Data} */
    const DCommand = spec['TeqFw_Core_App_Cli_Command#Data']; // class constructor

    // DEFINE INNER FUNCTIONS
    /**
     * Print out current version of the application.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Core_App_Cli_Version
     */
    const action = async function () {
        console.log(`Application version: ${bootCfg.version}.`);
    };

    // MAIN FUNCTIONALITY
    Object.defineProperty(action, 'name', {value: `${NS}.${action.name}`});

    // COMPOSE RESULT
    const result = new DCommand();
    result.ns = DEF.BACK_REALM;
    result.name = 'version';
    result.desc = 'Get version of the application.';
    result.action = action;
    return result;
}

// MODULE'S FUNCTIONALITY
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.name}`});

// MODULE'S EXPORT
export default Factory;
