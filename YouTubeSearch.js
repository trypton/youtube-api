/**
 * @file Perform search through YouTube videos
 */

import YouTubeApi from './YouTubeApi.js';

/**
 * @class Creates YouTube search object
 * @link https://developers.google.com/youtube/v3/docs/search/list
 * @extends YouTubeApi
 */
export default class YouTubeSearch extends YouTubeApi {
    /**
     * @param {Object} options - YouTube API parameters
     * @constructs
     */
    constructor(options = {}) {
        super(options);

        /**
         * @private
         */
        this._query = null;

        /**
         * @private
         */
        this._gen = null;
    }

    /**
     * YouTube API search URL
     */
    get url() {
        return 'https://www.googleapis.com/youtube/v3/search';
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
}
