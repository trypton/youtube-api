"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.YouTubeAuthError = exports.YouTubeApiError = exports.YouTubeError = void 0;

/**
 * @file YouTube error classes
 */

/**
 * @class Creates a new general YouTube error
 * @extends Error
 */
class YouTubeError extends Error {
  /**
   * @param {*} params - Error arguments
   * @constructs
   */
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, YouTubeError);
    }
  }

}
/**
 * @class Creates a new YouTube API error
 * @extends Error
 */


exports.YouTubeError = YouTubeError;

class YouTubeApiError extends Error {
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
/**
 * @class Creates a new YouTube Auth error
 * @extends Error
 */


exports.YouTubeApiError = YouTubeApiError;

class YouTubeAuthError extends Error {
  /**
   * @param {*} params - Error arguments
   * @constructs
   */
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, YouTubeAuthError);
    }
  }

}

exports.YouTubeAuthError = YouTubeAuthError;