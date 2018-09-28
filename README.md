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

### Authorization

Some API requests require authorization. In order to obtain access token you can use `YouTubeAuth` class. You need to set your `client_id` and `redirect_uri` along with other optional parameters. For `access_type=offline` the `client_secret` is also required. There is `.createAuthUrl()` method that creates an URL to Google authentication service. Redirect to that URL and after authentication the service redirects back to the `redirect_uri` with the response in hash or query string. Use `.extractResponseFromCallbackUrl()` static method in order to parse the response and `.fetchAccessTokenWithResponse(response)` method to obtain access token. Now you can store the token and use it for requests. See [Google guide](https://developers.google.com/youtube/v3/guides/authentication) and an [example](demo/index.html).

## Options

All class constructors have options parameter. It should have either `key` or `access_token` key. See next section for details.

Options object may contain any of supported YouTube API parameters. See particular [YouTube API reference](https://developers.google.com/youtube/v3/docs/) page for more details.

## Google API Key

You need to create [API key](https://developers.google.com/youtube/registering_an_application) in order to perform YouTube API requests. Some requests require authorization. In that case you need to create OAuth 2 credentials and use `YouTubeAuth` class to obtain access token.

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
