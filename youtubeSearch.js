import { YouTubeError } from './youtubeError.js';

export class YoutubeSearch {
    static get API_URL() {
        return 'https://www.googleapis.com/youtube/v3/search?';
    }

    static get REQUEST_TIMEOUT() {
        return 5000;
    }

    /**
     * @param {Object} params - Query string params
     * @returns {String}
     */
    static makeQueryString(params = {}) {
        return Object.keys(params)
            .map(param => `${param}=` + encodeURIComponent(params[param]))
            .join('&');
    }

    /**
     * @param {Object} options - YouTube API parameters
     */
    constructor(options = {}) {
        this.options = { ...options };

        this._requestTimeout = options.timeout || YoutubeSearch.REQUEST_TIMEOUT;
        delete options.timeout;

        /**
         * @private
         */
        this._gen = null;

        /**
         * @private
         */
        this._query = null;
    }

    /**
     * Make search request.
     * Each call with the same query string returns next page.
     * @param {String} query - Query search string
     * @returns {Promise}
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
     * This function returns a generator. Each iteration returns the next page.
     * @returns {Generator}
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
     * Make request to YouTube API
     * @link https://developers.google.com/youtube/v3/docs/search/list
     * @param {Object} options - Parameters the request should be performed with
     * @returns {Promise}
     */
    async _makeApiRequest(options = {}) {
        const timeoutId = setTimeout(() => {
            throw new Error('Request timeout.');
        }, this._requestTimeout);

        const resp = await fetch(YoutubeSearch.API_URL + YoutubeSearch.makeQueryString(options));

        clearTimeout(timeoutId);

        const data = await resp.json();
        if (!resp.ok) {
            if (data && data.error) {
                throw new YouTubeError(data.error);
            }
            throw new Error(resp.statusText);
        }
        return data;
    }
}
