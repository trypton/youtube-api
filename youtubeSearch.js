/**
 * @file Perform search through YouTube videos
 */

import { YouTubeError } from './YouTubeError.js';

const isAbortControllerSupported = typeof AbortController === 'function';

/**
 * @class Creates YouTube search object
 */
export default class YouTubeSearch {
    /**
     * YouTube API search URL
     * @static
     */
    static get API_URL() {
        return 'https://www.googleapis.com/youtube/v3/search?';
    }

    /**
     * Request timeout in ms
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
        this.options = { ...options };

        /**
         * @private
         */
        this._requestTimeout = 'timeout' in this.options ? this.options.timeout : YouTubeSearch.REQUEST_TIMEOUT;
        delete this.options.timeout;

        /**
         * @private
         */
        this._query = null;

        /**
         * @private
         */
        this._gen = null;

        /**
         * @private
         */
        this._abortController = null;
    }

    /**
     * Make search request.
     * Each call with the same query string returns next page.
     * @param {String} query - Query search string
     * @returns {Promise}
     * @public
     */
    async search(query) {
        if (!this._query || query !== this._query) {
            this._query = query;
            this._gen = this._getSearchResultGenerator();
        }
        const { done, value } = await this._gen.next();
        return done ? [] : value.items;
    }

    /**
     * Abort the current search request.
     * @public
     */
    abort() {
        if (this._abortController) {
            this._abortController.abort();
            this._abortController = null;
        }
    }

    /**
     * This function returns a generator. Each iteration returns the next page.
     * @yields {Promise} Promise that resolves to response from YouTube API
     * @returns {Generator}
     * @private
     */
    async *_getSearchResultGenerator() {
        let etag;
        let nextPageToken = this.options.pageToken;

        const params = {
            ...this.options,
            q: this._query
        };

        while (!etag || nextPageToken) {
            if (nextPageToken) {
                params.pageToken = nextPageToken;
            }

            const result = await this._makeApiRequest(params);

            // Finish the generator if no result was returned
            if (!result) {
                return;
            }

            nextPageToken = result.nextPageToken;
            etag = result.etag;
            yield result;
        }
    }

    /**
     * Make request to [YouTube API]{@link https://developers.google.com/youtube/v3/docs/search/list}
     * @param {Object} params - Parameters the request should be performed with
     * @returns {Promise}
     * @private
     */
    async _makeApiRequest(params = {}) {
        let timeoutId;
        const timeout = new Promise((resolve, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error('Request timeout.'));
            }, this._requestTimeout);
        });

        if (!this._abortController && isAbortControllerSupported) {
            this._abortController = new AbortController();
        }

        const signal = this._abortController && this._abortController.signal;
        const url = YouTubeSearch.API_URL + YouTubeSearch.makeQueryString(params);

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
                throw new YouTubeError(data.error);
            }
            throw new Error(response.statusText);
        }

        return data;
    }
}
