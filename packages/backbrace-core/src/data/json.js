import { DataHandler } from '../providers/data';
import { settings } from '../settings';

/**
 * @class JSONHandler
 * @augments DataHandler
 * @description
 * JSON file handler.
 */
export default class JSONHandler extends DataHandler {

    /**
     * @override
     **/
    async find(options, params, page, section) {

        /**
         * @ignore
         * @type {import('../types').dataInfo}
         */
        let ret = {
            count: 0,
            error: '',
            data: null
        };

        let res = await window.fetch(`${settings.dir.design}${options.source}`);
        if (res.ok) {
            ret.data = await res.json();
        } else {
            ret.error = res.statusText;
        }

        return ret;
    }

}
