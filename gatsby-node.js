const axios = require('axios');
const crypto = require('crypto');

const getVideos = async ({
  url, clientID, clientSecret, userID, searchQuery,
}) => {
  try {
    const _searchQuery = searchQuery || '';
    const _url =
      url || `https://api.vimeo.com/users/${userID}/videos?per_page=100&query=${_searchQuery}`;
    const response = await axios.get(_url, {
      auth: {
        username: clientID,
        password: clientSecret,
      },
    });

    let videos = response.data.data;

    if (response.data.paging.next) {
      const moreVideos = await getVideos({
        url: `https://api.vimeo.com${response.data.paging.next}`,
        clientID,
        clientSecret,
      });
      videos = videos.concat(moreVideos);
    }
    return videos;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const digest = resource =>
  crypto
    .createHash('md5')
    .update(JSON.stringify(resource))
    .digest('hex');

const parseVideos = (video) => {
  const videoID = video.uri.replace('/videos/', '');
  const videoThumbnail = video.pictures.uri
    .match(/\/pictures\/\w+/gi)[0]
    .replace(/\/pictures\//gi, '');
  const videoThumbnailUrl = `https://i.vimeocdn.com/video/${videoThumbnail}`;

  const userID = video.uri.replace('/users/', '');
  const userThumbnail = video.user.pictures.uri
    .match(/\/pictures\/\w+/gi)[0]
    .replace(/\/pictures\//gi, '');
  const userThumbnailUrl = `https://i.vimeocdn.com/portrait/${userThumbnail}`;

  return {
    id: videoID,
    parent: '__SOURCE__',
    children: [],
    internal: {
      type: 'Vimeo____video',
      contentDigest: digest(video),
    },
    title: video.name,
    description: video.description,
    date: video.created_time,
    url: video.link,
    duration: video.duration,
    iframe: video.embed.html,
    thumbnail: {
      small: `${videoThumbnailUrl}_295x166.jpg`,
      medium: `${videoThumbnailUrl}_640x360.jpg`,
      large: `${videoThumbnailUrl}_1280x720.jpg`,
      hd: `${videoThumbnailUrl}_1920x1080.jpg`,
    },
    user: {
      id: userID,
      parent: '__SOURCE__',
      children: [],
      internal: {
        type: 'Vimeo___user',
        contentDigest: digest(video.user),
      },
      name: video.user.name,
      url: video.user.link,
      bio: video.user.bio,
      thumbnail: {
        small: `${userThumbnailUrl}_72x72.jpg`,
        medium: `${userThumbnailUrl}_144x144.jpg`,
        large: `${userThumbnailUrl}_288x288.jpg`,
      },
    },
  };
};

exports.sourceNodes = async ({ boundActionCreators }, { clientID, clientSecret, userID }) => {
  const { createNode } = boundActionCreators;

  try {
    const videos = await getVideos({ clientID, clientSecret, userID });

    videos.forEach(video => createNode(parseVideos(video)));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
