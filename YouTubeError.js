/**
 * @file YouTube error class
 */

/**
 * @class Creates new YouTube error
 * @extends Error
 */
export default class YouTubeError extends Error {
    /**
     * @param {Object} error - Error object from YouTube response
     * @param {*} params - Remaining arguments. @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
     * @constructs
     */
    constructor(error, ...params) {
        super(error.message, ...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, YouTubeError);
        }
        this.code = error.code;
        this.errors = error.errors;
    }
}
