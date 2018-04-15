# Search for YouTube videos

This is a small ES6 module to perform a search through YouTube videos.

## Usage

```javascript
import { YoutubeSearch } from 'youtubesearch';

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
    return null;
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

## Google API Key

You need to get [API key](https://developers.google.com/maps/documentation/javascript/get-api-key) in order to search YouTube for videos.

## Options

Options object may contain any of supported YouTube API [parameters](https://developers.google.com/youtube/v3/docs/search/list).
`q` parameter will be replaced with search query string of the `.search()` method.

## Timeout

Request timeout is `5000ms` by default. You can change it with `options.timeout`.

```javascript
const options = {
  key: 'YOUTUBE_API_KEY',
  part: 'snippet',
  timeout: 3000
};
```

## Aborting request

You can abort a search request by calling `.abort()` method.

```javascript
async function search(searcher, query) {
  // if we're not interested in the previous search results anymore
  // abort a previous request if it exists and is not finished
  searcher.abort();

  try {
    return await searcher.search(query);
  } catch (e) {
    // Handle error
    return null;
  }
}
```
