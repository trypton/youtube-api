// Simple express application that can perform Google authorization
// DON'T USE THIS CODE IN PRODUCTION

import path from 'path';
import fs from 'fs';
import querystring from 'querystring';
import express from 'express';

import YouTubeApi from '../index.js';
const { YouTubeAuth } = YouTubeApi;

// Workaround for __dirname
import expose from './expose.js';
const { __dirname } = expose;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const app = express();
const port = process.env.PORT || 5500;

// Reuse index.html for server side authorization workflow
app.use('/src', express.static(path.join(__dirname, '../src')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// This route performs the following operation:
// 1. Obtains a new access token with refresh token if exists
// 2. Redirects to the Google Authorization service if refresh token doesn't exist
// 3. Handles response from Google, obtains a new access token and stores it
app.get('/oauth', (req, res) => {
    const redirectUri = `${req.protocol}://${req.hostname}:${port}${req.path}`;
    const auth = new YouTubeAuth({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
    });

    // Generate a custom event to send it to the parent window with a token or an error
    const sendResponse = data => {
        const token = data.token
            ? querystring.stringify(data.token, ',', ':', {
                  encodeURIComponent: s => {
                      return `'${s.replace("'", "\\'")}'`;
                  }
              })
            : '';

        const html = `
            <script>
                var data = {};
                data.error = ${data.error ? "new Error('" + data.error.message.replace("'", "\\'") + "')" : null};
                data.token = ${token ? '{' + token + '}' : null};
                const event = new CustomEvent('${token ? 'auth-success' : 'auth-fail'}', { detail: data });
                window.opener.dispatchEvent(event);
                window.close();
            </script>
        `;

        res.send(html);
    };

    const saveTokenAndSendResponse = token => {
        // Token should be saved for each user separately
        fs.writeFile(path.join(__dirname, 'token.json'), JSON.stringify(token), 'utf8', () => {
            // Send a new access token to the client
            // Refresh token should be stored on server side only
            delete token.refresh_token;
            sendResponse({ token });
        });
    };

    const sendError = error => {
        sendResponse({ error });
    };

    // Redirect to Google OAuth service
    const redirectToAuthorizationServer = () => {
        const oauthUrl = YouTubeAuth.createAuthUrl({
            client_id: clientId,
            redirect_uri: redirectUri,
            access_type: 'offline',
            prompt: 'consent'
        });
        res.redirect(oauthUrl);
    };

    // Check if Google redirected to the route with response
    if (Object.keys(req.query).length) {
        // Obtain access and refresh token with a code
        const response = req.query;
        auth.fetchAccessTokenWithResponse(response)
            .then(saveTokenAndSendResponse)
            .catch(sendError);
    } else {
        // Obtain access token with refresh token if exists
        fs.readFile(path.join(__dirname, 'token.json'), 'utf8', (err, data) => {
            if (err) {
                // Redirect to auth server if there is no saved token
                if (err.code === 'ENOENT') {
                    redirectToAuthorizationServer();
                } else {
                    res.status(500).send('Unable to read token file.');
                }
                return;
            }

            try {
                const token = JSON.parse(data);
                if (!token.refresh_token) {
                    redirectToAuthorizationServer();
                } else {
                    auth.fetchAccessTokenWithRefreshToken(token.refresh_token)
                        .then(saveTokenAndSendResponse)
                        .catch(sendError);
                }
            } catch (e) {
                res.status(500).send('Token file is invalid.');
            }
        });
    }
});

// Listen
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`);
});
