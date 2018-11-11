"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _YouTubeApi = _interopRequireDefault(require("./YouTubeApi.js"));

var _YouTubeError = require("./YouTubeError.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file Retrieve YouTube video captions
 */

/**
 * @class Creates YouTube captions object
 * @link https://developers.google.com/youtube/v3/docs/captions
 * @extends YouTubeApi
 */
class YouTubeCaptions extends _YouTubeApi.default {
  /**
   * Id part of caption
   * @static
   */
  static get PART_ID() {
    return 'id';
  }
  /**
   * Snippet part of caption
   * @static
   */


  static get PART_SNIPPET() {
    return 'snippet';
  }
  /**
   * SubViewer subtitle
   * @static
   */


  static get FORMAT_SBV() {
    return 'sbv';
  }
  /**
   * Scenarist Closed Caption format
   * @static
   */


  static get FORMAT_SCC() {
    return 'scc';
  }
  /**
   * SubRip subtitle
   * @static
   */


  static get FORMAT_SRT() {
    return 'srt';
  }
  /**
   * Timed Text Markup Language caption
   * @static
   */


  static get FORMAT_TTML() {
    return 'ttml';
  }
  /**
   * Web Video Text Tracks caption
   * @static
   */


  static get FORMAT_VTT() {
    return 'vtt';
  }
  /**
   * @param {Object} options - YouTube API parameters
   * @constructs
   */


  constructor(options = {}) {
    super(options);
  }
  /**
   * YouTube API captions endpoint
   * @private
   */


  get url() {
    return 'https://www.googleapis.com/youtube/v3/captions';
  }
  /**
   * Get captions list of video.
   * @link https://developers.google.com/youtube/v3/docs/captions/list
   * @param {String} videoId - Video ID
   * @param {String} part - Caption resource parts
   * @returns {Promise}
   * @public
   */


  list(videoId, part = 'id') {
    const params = {
      part,
      videoId
    };
    return this.makeApiRequest({
      params
    });
  }
  /**
   * Download caption by id.
   * @link https://developers.google.com/youtube/v3/docs/captions/download
   * @param {String} id - Caption id
   * @param {String} format - Specifies that the caption track should be returned in a specific format
   * @returns {Promise}
   * @throws YouTubeError if access token is not set
   * @public
   */


  download(id, format = null) {
    if (!this.accessToken) {
      throw new _YouTubeError.YouTubeError('This action requires authorization.');
    }

    const url = this.at(id);
    const params = {};

    if (format) {
      params.format = format;
    }

    return this.makeApiRequest({
      url,
      params
    });
  }

}

exports.default = YouTubeCaptions;