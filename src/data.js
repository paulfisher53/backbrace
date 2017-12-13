/**
 * Data module.
 * @module
 */
'use strict';

var $code = require('./code'),
    $config = require('./config'),
    $http = require('./http'),
    Page = require('./Classes/Page');

/**
 * Get a page.
 * @param {string} name - Name of the page to load.
 * @returns {JQueryPromise}
 */
function page(name) {
    return $code.block(
        function() {
            // Get the page from the page dir.
            return $http.get($config.data.pages.dir + '/' + name + '.json');
        },
        function(data) {
            if (data) {
                return new Page(data);
            }
        }
    );
}

module.exports = {
    page: page
};
