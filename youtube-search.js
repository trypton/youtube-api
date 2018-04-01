const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search?';

function makeUriQueryString(params = {}) {
    return Object.keys(params)
        .map(param => param + '=' + encodeURIComponent(params[param]))
        .join('&');
}

function makeApiRequest(options = {}) {
    let url = YOUTUBE_API_URL + makeUriQueryString(options);
    return fetch(url).then(resp => {
        return resp.json();
    });
}

async function* search(options = {}) {
    let etag;
    let nextPageToken = options.pageToken;
    while (!etag || nextPageToken) {
        if (nextPageToken) {
            options.pageToken = nextPageToken;
        }
        let result = await makeApiRequest(options);
        nextPageToken = result.nextPageToken;
        etag = result.etag;
        yield result;
    }
}

export function YoutubeSearch(options = {}) {
    let gen;
    let lastQuery;
    this.search = async query => {
        if (!lastQuery || query !== lastQuery) {
            lastQuery = query;
            gen = search(options);
        }
        let data = await gen.next();
        return data.value;
    };
}
