/**
 * @file Perform YouTube OAuth2 authorization
 */

import YouTubeApi from './YouTubeApi.js';
import { YouTubeAuthError } from './YouTubeError.js';

/**
 * @class YouTube authorization with OAuth 2.0
 * @link https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps
 * @extends YouTubeApi
 */
export default class YouTubeAuth extends YouTubeApi {
    /**
     * Default access scope. Manage your YouTube account.
     * @static
     */
    static get SCOPE_DEFAULT() {
        return 'https://www.googleapis.com/auth/youtube';
    }

    /**
     * Force SSL access scope. Manage your YouTube account.
     * @static
     */
    static get SCOPE_DEFAULT_SSL() {
        return 'https://www.googleapis.com/auth/youtube.force-ssl';
    }

    /**
     * Read only access scope. View your YouTube account.
     * @static
     */
    static get SCOPE_READONLY() {
        return 'https://www.googleapis.com/auth/youtube.readonly';
    }

    /**
     * Upload access scope. Manage your YouTube videos.
     * @static
     */
    static get SCOPE_UPLOAD() {
        return 'https://www.googleapis.com/auth/youtube.upload';
    }

    /**
     * Partner access scope. View and manage your assets and associated content on YouTube.
     * @static
     */
    static get SCOPE_YOUTUBEPARTNER() {
        return 'https://www.googleapis.com/auth/youtubepartner';
    }

    /**
     * Partner audit access scope. View private information of your YouTube channel relevant during the audit process with a YouTube partner.
     * @static
     */
    static get SCOPE_YOUTUBEPARTNER_AUDIT() {
        return 'https://www.googleapis.com/auth/youtubepartner-channel-audit';
    }

    /**
     * @param {Object} options - YouTube auth parameters
     * @constructs
     */
    constructor(options = {}) {
        super({ ...options });
    }

    /**
     * Redirect to Google Authentication service
     * @param {Object} params - additional auth params
     * @public
     */
    singIn(params = {}) {
        const url = 'https://accounts.google.com/o/oauth2/v2/auth';
        params = {
            scope: YouTubeAuth.SCOPE_DEFAULT_SSL,
            response_type: 'token',
            ...params
        };
        window.location = url + '?' + YouTubeApi.makeQueryString({ ...this.options, ...params });
    }

    /**
     * Parse response and validate access token
     * @param {String} response - Hash string from redirected url
     * @returns {Object} Params with valid access_token
     * @throws YouTubeAuthError if validation fails
     * @public
     */
    async validate(response) {
        const params = {};
        response = response.split('&');
        for (let i = 0; i < response.length; i++) {
            const param = response[i].split('=');
            if (param.length === 2) {
                params[encodeURIComponent(param[0])] = encodeURIComponent(param[1]);
            }
        }

        if (params.error) {
            throw new YouTubeAuthError(params.error);
        }

        const url = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
        const data = await this.makeApiRequest({ url, params: { access_token: params.access_token } });
        if (data.aud !== this.options.client_id) {
            throw new YouTubeAuthError('Client ID does not match.');
        }
        params.scope = data.scope;
        return params;
    }
}
