# YouTube API

This is a small library with no dependencies* to work with YouTube API.
Can work either on client side or with nodejs.

<small>*node-fetch is required in nodejs environment</small>

## Usage

### Search for videos

```javascript
import { YoutubeSearch } from 'youtube-api';

const options = {
  key: 'YOUTUBE_API_KEY',
  part: 'snippet',
  maxResults: 10
};

async function search(searcher, query) {
  try {
    return await searcher.search(query);
  } catch (e) {
    // Handle error
  }
}

const youtubeSearcher = new YoutubeSearch(options);

// .search() method returns an array of videos
// it's size less or equals maxResults
// or 0 if there are no more results or request was aborted with .abort()
const first10Videos = search(youtubeSearcher, 'search query');

// calling .search() again with the same query string returns the next resulting page
const next10Videos = search(youtubeSearcher, 'search query');
```

You can call `.search()` method with the same search query string in order to get the next page of found videos.

### Video details

Retrieve a list of videos with details.

```javascript
import { YoutubeVideos } from 'youtube-api';

const options = {
  key: 'YOUTUBE_API_KEY'
};

// Array of video ids
const videoId = ['videoId'];

const videos = new YouTubeVideos({ ...options, part: 'id' });
videos.list(videoId).then(res => {
    console.log(res);
});
```

### Captions

You can retrieve a list of video captions or download a particular caption. Please note that downloading captions requires authorization.

```javascript
import { YoutubeCaptions } from 'youtube-api';

const options = {
  access_token: 'YOUTUBE_ACCESS_TOKEN'
};

// Video ID
const videoId = 'videoId';

const captions = new YoutubeCaptions(options);

// The first parameter is string with video id
// The second parameter is part. May be 'id' or 'snippet'.
// https://developers.google.com/youtube/v3/docs/captions/list
captions.list(videoId, 'snippet').then(res => {
    if (res.items.length) {
        // Retrieve the first caption track
        captions.download(res.items[0].id).then(blob => {
            // returns Blob
        });
    }
});
```

## Options

All class constructors have options parameter. It should have either `key` or `access_token` key. See next sections for details.

Options object may contain any of supported YouTube API parameters. See particular [YouTube API reference](https://developers.google.com/youtube/v3/docs/) page for more details.

## Google API Key

You need to create an [API key](https://developers.google.com/youtube/registering_an_application) in order to perform YouTube API requests. Some requests require authorization. In that case you need to create OAuth 2 credentials and use `YouTubeAuth` class to obtain access token.

## Authorization

Some API requests require authorization. In order to obtain access token to perform such requests you can use `YouTubeAuth` class. There is `YouTubeAuth.createAuthUrl(params)` static method that creates an URL to Google authorization server. You need to pass your `client_id` and `redirect_uri` along with other optional parameters to it and then redirect user to the returned URL. After authentication the server redirects back to the `redirect_uri` with the response in hash or query string (depends on access type). For `access_type=offline` the `client_secret` is required as well. Then use `.fetchAccessTokenWithCallbackUrl(callbackUrl)` method in order to obtain access token. If server returns an error an exception will be thrown. You can store the token and use it for requests instead of API key. For `access_type=offline` a refresh token will be also provided. Store it in a secure place and use for refreshing access token once it's expired. See [Google guide](https://developers.google.com/youtube/v3/guides/authentication) and an [example](demo/index.html) for details.

### Revoke token

Server side application can revoke access token with `.revokeToken(token)` method of `YouTubeAuth` instance. It accepts token obtained with one of `.fetchAccessToken*` methods. In order to revoke access token of client side application follow [documentation](https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps#tokenrevoke).

## Timeout

Request timeout is `5000ms` by default. You can change it with `options.timeout`.

```javascript
const options = {
  key: 'YOUTUBE_API_KEY',
  // Number of milliseconds
  timeout: 3000
};
```

## Aborting request

You can abort a request by calling `.abort()` method.

```javascript
const searcher = new YoutubeSearch(options);
searcher.search(query).then(results => { ... });
// Abort the previous request
searcher.abort();
searcher.search(query).then(results => { ... });
```
