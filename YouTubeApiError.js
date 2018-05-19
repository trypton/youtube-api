/**
 * @file YouTube API error class
 */

/**
 * @class Creates new YouTube API error
 * @extends Error
 */
export default class YouTubeApiError extends Error {
    /**
     * @param {Object} error - Error object from YouTube response
     * @param {*} params - Remaining arguments. @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
     * @constructs
     */
    constructor(error, ...params) {
        super(error.message, ...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, YouTubeApiError);
        }
        this.code = error.code;
        this.errors = error.errors;
    }
}
