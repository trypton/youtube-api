import { YouTubeError } from './youtubeError.js';

const isAbortControllerSupported = typeof AbortController === 'function';

export class YoutubeSearch {
    /**
     * @static
     */
    static get API_URL() {
        return 'https://www.googleapis.com/youtube/v3/search?';
    }

    /**
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
     * @constructor
     */
    constructor(options = {}) {
        this.options = { ...options };

        /**
         * @private
         */
        this._requestTimeout = 'timeout' in options ? options.timeout : YoutubeSearch.REQUEST_TIMEOUT;
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
        const data = await this._gen.next();
        return data.done ? [] : data.value.items;
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
    async* _getSearchResultGenerator() { // eslint-disable-line prettier/prettier
        let etag;
        let nextPageToken = this.options.pageToken;
        const options = { ...this.options, q: this._query };
        while (!etag || nextPageToken) {
            if (nextPageToken) {
                options.pageToken = nextPageToken;
            }
            const result = await this._makeApiRequest(options);
            nextPageToken = result.nextPageToken;
            etag = result.etag;
            yield result;
        }
    }

    /**
     * Make request to [YouTube API]{@link https://developers.google.com/youtube/v3/docs/search/list}
     * @param {Object} options - Parameters the request should be performed with
     * @returns {Promise}
     * @private
     */
    async _makeApiRequest(options = {}) {
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
        const url = YoutubeSearch.API_URL + YoutubeSearch.makeQueryString(options);

        const response = await Promise.race([fetch(url, { signal }), timeout]);

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
