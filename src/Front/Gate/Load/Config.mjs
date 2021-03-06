/**
 * Frontend gate to "Save one field of user profile" service.
 */
export default function TeqFw_Core_App_Front_Gate_Load_Config(spec) {
    /** @type {TeqFw_Core_App_Defaults} */
    const DEF = spec['TeqFw_Core_App_Defaults$'];   // instance singleton
    /** @type {TeqFw_Core_App_Front_Data_Config} */
    const config = spec[DEF.DI_CONFIG]; // named singleton
    /** @type {TeqFw_Di_Container} */
    const container = spec['TeqFw_Di_Container$'];  // instance singleton
    /** @type {typeof TeqFw_Core_App_Shared_Api_Route_Load_Config_Response} */
    const Response = spec['TeqFw_Core_App_Shared_Api_Route_Load_Config#Response']; // class constructor
    /** @type {typeof TeqFw_Core_App_Front_Gate_Response_Error} */
    const GateError = spec['TeqFw_Core_App_Front_Gate_Response_Error#'];    // class constructor

    // TODO: we need to map gate to API URI
    const URL = `https://${config.urlBase}/api/${DEF.API_LOAD_CFG}`;

    /**
     * @param {TeqFw_Core_App_Shared_Api_Route_Load_Config_Request} data
     * @returns {Promise<TeqFw_Core_App_Shared_Api_Route_Load_Config_Response|TeqFw_Core_App_Front_Gate_Response_Error>}
     * @memberOf TeqFw_Core_App_Front_Gate_Load_Config
     */
    async function gate(data) {
        try {
            // TODO: ajax loader interface from core should be here
            const store = await container.get(DEF.DI_STORE); // named singleton
            store.commit('app/startLoader');
            const res = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({data})
            });
            store.commit('app/stopLoader');
            const json = await res.json();
            /** @type {TeqFw_Core_App_Shared_Api_Route_Load_Config_Response} */
            const result = new Response();
            Object.assign(result, json.data);
            return result;
        } catch (e) {
            // infrastructure error
            const result = new GateError();
            result.error = Object.assign({}, e);
            if (e.message) result.message = e.message;
            return result;
        }
    }

    // COMPOSE RESULT
    Object.defineProperty(gate, 'name', {value: 'TeqFw_Core_App_Front_Gate_Load_Config.gate'});
    return gate;
}

