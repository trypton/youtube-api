# YouTube API

This is a small library with ES6 modules to work with YouTube API.

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
const first10Videos = search(youtubeSearcher, 'search_query');

// calling .search() again with the same query string returns the next resulting page
const next10Videos = search(youtubeSearcher, 'search_query');
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

You need to create [API key](https://developers.google.com/youtube/registering_an_application) in order to perform YouTube API requests. Some requests require authorization. In that case you need to create OAuth 2 credentials and use `YouTubeAuth` class to obtain access token.

### Authorization

Some API requests require authorization. In order to obtain access token you can use `YouTubeAuth` class. There is `YouTubeAuth.createAuthUrl(params)` static method that creates an URL to Google authentication service. You need to pass your `client_id` and `redirect_uri` along with other optional parameters to it. Redirect to the returned URL and after authentication the service redirects back to the `redirect_uri` with the response in hash or query string (depends on access type). For `access_type=offline` the `client_secret` is required. Then use `.fetchAccessTokenWithCallbackUrl(callbackUrl)` method in order to obtain access token. Now you can store the token and use it for requests instead of API key. See [Google guide](https://developers.google.com/youtube/v3/guides/authentication) and an [example](demo/index.html).

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
