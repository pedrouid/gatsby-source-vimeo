# gatsby-source-vimeo

Source plugin for pulling data into Gatsby from Vimeo user videos endpoint.

You will need to register on Vimeo to get API keys to use this plugin:
https://developer.vimeo.com/apps/new

## Install

`npm install --save gatsby-source-vimeo`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-vimeo`,
    options: {
      clientID: 'INSERT_YOUR_CLIENT_IDENTIFIER',
      clientSecret: 'INSERT_YOUR_CLIENT_SECRET',
      userID: 'INSERT_VIMEO_USER_ID_TO_FETCH_VIDEOS',
      searchQuery: 'INSERT_SEARCH_QUERY [OPTIONAL]',
    },
  },
];
```

###### Note

Remember you are only fetching video information, so this will provide
you with Video titles, descriptions, embedded iframes and thumbnails.
