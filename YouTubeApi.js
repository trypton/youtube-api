/**
 * @file YouTube API base class
 */

import YouTubeApiError from './YouTubeApiError.js';

const isAbortControllerSupported = typeof AbortController === 'function';

/**
 * @class YouTube API base class
 * @abstract
 */
export default class YouTubeApi {
    /**
     * Request timeout in ms.
     * @static
     */
    static get REQUEST_TIMEOUT() {
        return 5000;
    }

    /**
     * @param {Object} params - Query string params
     * @returns {String}
     * @static
     */
    static makeQueryString(params = {}) {
        return Object.keys(params)
            .map(param => `${param}=` + encodeURIComponent(params[param]))
            .join('&');
    }

    /**
     * @param {Object} options - YouTube API parameters
     * @constructs
     */
    constructor(options = {}) {
        if (this.constructor.name === 'YouTubeApi') {
            throw new TypeError('YouTubeApi must not be constructed directly.');
        }

        this.options = { ...options };

        /**
         * @private
         */
        this.requestTimeout = 'timeout' in this.options ? this.options.timeout : YouTubeApi.REQUEST_TIMEOUT;
        delete this.options.timeout;

        /**
         * @private
         */
        this.abortController = null;
    }

    /**
     * YouTube API endpoint URL.
     * Must be defined in inherited class.
     * @static
     */
    get url() {
        throw new ReferenceError('API endpoint URL is not defined.');
    }

    /**
     * Abort the current search request.
     * @public
     */
    abort() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    /**
     * Make request to [YouTube API]{@link https://developers.google.com/youtube/v3/docs/}
     * @param {Object} params - Parameters the request should be performed with
     * @returns {Promise}
     * @private
     */
    async makeApiRequest(params = {}) {
        let timeoutId;
        const timeout = new Promise((resolve, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error('Request timeout.'));
            }, this.requestTimeout);
        });

        if (!this.abortController && isAbortControllerSupported) {
            this.abortController = new AbortController();
        }

        const signal = this.abortController && this.abortController.signal;
        const url = this.url + '?' + YouTubeApi.makeQueryString(params);

        let response;
        try {
            response = await Promise.race([fetch(url, { signal }), timeout]);
        } catch (e) {
            // Ignore errors caused by aborting request
            if (e.name === 'AbortError') {
                return Promise.resolve();
            }
            throw e;
        }

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            if (data && data.error) {
                throw new YouTubeApiError(data.error);
            }
            throw new Error(response.statusText);
        }

        return data;
    }
}
