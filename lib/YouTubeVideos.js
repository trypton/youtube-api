"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _YouTubeApi = _interopRequireDefault(require("./YouTubeApi.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file Retrieve YouTube videos
 */

/**
 * @class Creates YouTube videos object
 * @link https://developers.google.com/youtube/v3/docs/videos/list
 * @extends YouTubeApi
 */
class YouTubeVideos extends _YouTubeApi.default {
  /**
   * List of supported video parts with quota cost
   * @static
   */
  static get PARTS() {
    return {
      contentDetails: 2,
      fileDetails: 1,
      id: 0,
      liveStreamingDetails: 2,
      localizations: 2,
      player: 0,
      processingDetails: 1,
      recordingDetails: 2,
      snippet: 2,
      statistics: 2,
      status: 2,
      suggestions: 1,
      topicDetails: 2
    };
  }
  /**
   * @param {Object} options - YouTube API parameters
   * @constructs
   */


  constructor(options = {}) {
    super(options);
  }
  /**
   * YouTube API videos endpoint
   * @private
   */


  get url() {
    return 'https://www.googleapis.com/youtube/v3/videos';
  }
  /**
   * Get list of videos.
   * @param {Array|String} id - List of video id
   * @returns {Promise}
   * @public
   */


  list(id) {
    id = Array.isArray(id) ? id : [id];
    const params = {
      id: id.join(',')
    };
    return this.makeApiRequest({
      params
    });
  }

}

exports.default = YouTubeVideos;