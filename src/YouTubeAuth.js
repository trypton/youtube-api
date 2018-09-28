/**
 * @file Perform YouTube OAuth2 authorization
 */

import YouTubeApi from './YouTubeApi.js';
import { YouTubeAuthError } from './YouTubeError.js';

/**
 * @class YouTube authorization with OAuth 2.0
 * @link https://developers.google.com/youtube/v3/guides/authentication
 * @extends YouTubeApi
 */
export default class YouTubeAuth extends YouTubeApi {
    /**
     * Authentication URL
     * @static
     */
    static get URL_AUTH() {
        return 'https://accounts.google.com/o/oauth2/v2/auth';
    }

    /**
     * Token info URL
     * @static
     */
    static get URL_TOKEN_INFO() {
        return 'https://www.googleapis.com/oauth2/v3/tokeninfo';
    }

    /**
     * Token URL
     * @static
     */
    static get URL_TOKEN() {
        return 'https://www.googleapis.com/oauth2/v4/token';
    }

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
     * Extract response data from a callback URL
     * @param {String} callbackUrl - full URL the authentication service redirected to (for example, window.location.href)
     * @returns {Object|null} - parsed hash or query string of URL. Returns null if there are no any params
     * @static
     */
    static extractResponseFromCallbackUrl(callbackUrl) {
        const url = new URL(callbackUrl);

        // URLSearchParams constructor ignores only ? leading char
        const query = (url.hash && url.hash.substring(1)) || url.search;

        if (!query.length) {
            return null;
        }

        // Parse query string
        const params = new URLSearchParams(query);

        // Convert URLSearchParams object to plain object
        const response = {};
        for (let param of params.keys()) {
            response[param] = params.get(param);
        }

        return response;
    }

    /**
     * Check if the access token is expired
     * @param {Object} token - token to check
     * @param {String} token.access_token - access token
     * @param {Number} token.expires_in - the number of seconds left before the token becomes invalid
     * @param {Number} token.created - timestamp when token is created
     * @returns {Boolean} - true if token is expired or invalid
     * @static
     */
    static isAccessTokenExpired(token) {
        if (!token || !token.access_token || !token.created || !token.expires_in) {
            throw new TypeError('Invalid token');
        }
        return token.created + (token.expires_in - 30) * 1000 < Date.now();
    }

    /**
     * @param {Object} options - YouTube auth parameters
     * @param {String} options.client_id
     * @param {String} options.client_secret
     * @param {String} options.redirect_uri
     * @param {String} options.response_type
     * @param {String} options.scope
     * @param {String} options.access_type
     * @param {String} options.state
     * @param {String} options.include_granted_scopes
     * @param {String} options.login_hint
     * @param {String} options.prompt
     * @constructs
     */
    constructor(options = {}) {
        options = Object.assign(
            // Default values
            {
                scope: YouTubeAuth.SCOPE_DEFAULT_SSL,
                include_granted_scopes: true,
                response_type: options.access_type === 'offline' ? 'code' : 'token'
            },
            options
        );

        // access_token can be ignored for authorization requests
        delete options.access_token;

        super(options);

        // store client_secret separately
        this.clientSecret = this.options.client_secret;
        delete this.options.client_secret;
    }

    /**
     * Create URL of Google Authentication service
     * @returns {String} - URL to redirect
     * @public
     */
    createAuthUrl() {
        const url = new URL(YouTubeAuth.URL_AUTH);
        url.search = YouTubeApi.makeQueryString(this.options);
        return url.href;
    }

    /**
     * Fetch access token
     * @param {Object} response - response data
     * @returns {Promise} - resolves to access token object
     * @throws TypeError in case of missing params in URL
     * @public
     */
    async fetchAccessTokenWithResponse(response) {
        // Perform some validation first
        this.validateResponse(response);

        // Auth server returns access token for online access type
        // It is necessary to validate it and return as is
        if (response.access_token) {
            const token = { ...response };
            token.created = Date.now();
            await this.validateAccessToken(token);
            return token;
        }

        // It is possible to request callback URL with refresh token param
        // It will return the new access token
        if (response.refresh_token) {
            return this.fetchAccessTokenWithRefreshToken(response.refresh_token);
        }

        // Offline access type - exchange an authorization code for an access token
        if (response.code) {
            return this.fetchAccessTokenWithCode(response.code);
        }

        throw new TypeError('An URL must contain one of these query params: assess_token, refresh_token or code.');
    }

    /**
     * Refresh an access token (offline access)
     * @param {String} refreshToken - a refresh token
     * @returns {Promise} - resolves to access token object
     * @public
     */
    async fetchAccessTokenWithRefreshToken(refreshToken) {
        const token = await this.makeApiRequest({
            url: YouTubeAuth.URL_TOKEN,
            params: {
                client_id: this.options.client_id,
                client_secret: this.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }
        });
        token.created = Date.now();
        return token;
    }

    /**
     * Exchange authorization code for an access token
     * @param {String} code - an authorization code returned by Google
     * @returns {Promise} - resolves to access token object
     * @public
     */
    async fetchAccessTokenWithCode(code) {
        const token = await this.makeApiRequest({
            url: YouTubeAuth.URL_TOKEN,
            method: 'POST',
            params: {
                code,
                client_id: this.options.client_id,
                client_secret: this.clientSecret,
                redirect_uri: this.options.redirect_uri,
                grant_type: 'authorization_code'
            }
        });
        token.created = Date.now();
        return token;
    }

    /**
     * Validate access token with online access type
     * @param {String} accessToken - Access token from the authentication service
     * @returns {Promise} resolves if validation passed, rejects otherwise
     * @public
     */
    async validateAccessToken(token) {
        const tokenInfo = await this.makeApiRequest({
            url: YouTubeAuth.URL_TOKEN_INFO,
            params: { access_token: token.access_token }
        });

        if (tokenInfo.error) {
            throw new YouTubeAuthError(tokenInfo.error);
        }

        if (tokenInfo.aud !== this.options.client_id) {
            throw new YouTubeAuthError('Client ID does not match.');
        }
    }

    /**
     * Validate authentication service callback response.
     * @param {Object} response - response data
     * @returns {void}
     * @throws YouTubeAuthError if validation fails
     * @private
     */
    validateResponse(response) {
        if (response.error) {
            throw new YouTubeAuthError(response.error);
        }

        if (response.scope !== this.options.scope) {
            throw new YouTubeAuthError('Scope does not match.');
        }

        if (response.state !== this.options.state) {
            throw new YouTubeAuthError('State does not match.');
        }
    }
}
