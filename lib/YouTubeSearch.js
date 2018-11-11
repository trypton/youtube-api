"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _YouTubeApi = _interopRequireDefault(require("./YouTubeApi.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _awaitAsyncGenerator(value) { return new _AwaitValue(value); }

function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }

function _AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; var wrappedAwait = value instanceof _AwaitValue; Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) { if (wrappedAwait) { resume("next", arg); return; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen.return !== "function") { this.return = undefined; } }

if (typeof Symbol === "function" && Symbol.asyncIterator) { _AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; }

_AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };

_AsyncGenerator.prototype.throw = function (arg) { return this._invoke("throw", arg); };

_AsyncGenerator.prototype.return = function (arg) { return this._invoke("return", arg); };

function _AwaitValue(value) { this.wrapped = value; }

/**
 * @class Creates YouTube search object
 * @link https://developers.google.com/youtube/v3/docs/search/list
 * @extends YouTubeApi
 */
class YouTubeSearch extends _YouTubeApi.default {
  /**
   * @param {Object} options - YouTube API parameters
   * @constructs
   */
  constructor(options = {}) {
    super(options);
    /**
     * @private
     */

    this.query = null;
    /**
     * @private
     */

    this.gen = null;
  }
  /**
   * YouTube API search endpoint
   * @private
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
    if (!this.query || query !== this.query) {
      this.query = query;
      this.gen = this.getSearchResultGenerator();
    }

    const {
      done,
      value
    } = await this.gen.next();
    return done ? [] : value.items;
  }
  /**
   * This function returns a generator. Each iteration returns the next page.
   * @yields {Promise} Promise that resolves to response from YouTube API
   * @returns {Generator}
   * @private
   */


  getSearchResultGenerator() {
    var _this = this;

    return _wrapAsyncGenerator(function* () {
      let etag;
      let nextPageToken = _this.options.pageToken;
      const params = {
        q: _this.query
      };

      while (!etag || nextPageToken) {
        if (nextPageToken) {
          params.pageToken = nextPageToken;
        }

        const result = yield _awaitAsyncGenerator(_this.makeApiRequest({
          params
        })); // Finish the generator if no result was returned

        if (!result) {
          return;
        }

        nextPageToken = result.nextPageToken;
        etag = result.etag;
        yield result;
      }
    })();
  }

}

exports.default = YouTubeSearch;