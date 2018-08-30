# gatsby-source-vimeo

Source plugin for pulling data into Gatsby from Vimeo user videos endpoint.

## Pre-requirements

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
      searchQuery: 'INSERT_SEARCH_QUERY',               // Optional
      transformer(video) {                              // Optional
        video.newField = 'value';
        return video;
      },
    },
  },
];
```

## Plugin Options

### clientID

###### REQUIRED

```
Client identifier from Vimeo Developer dashboard
```

### clientSecret

###### REQUIRED

```
Client secret from Vimeo Developer dashboard
```

### userID

###### REQUIRED

```
User ID that you want to fetch videos from
(visit Vimeo profile and run window.vimeo.config.profile.app_config.user.id
on browser console to get the userID)
```

### searchQuery

###### OPTIONAL

```
Keywords to filter videos to be fetched
(comma separated)
```

### transformer

###### OPTIONAL

```
Transformer function to add or alter existing fields
```

## Note

Remember you are only fetching video information, so this will provide
you with Video titles, descriptions, embedded iframes and thumbnails.
