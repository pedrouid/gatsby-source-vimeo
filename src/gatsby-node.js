const axios = require('axios');

const getVideos = async ({
  url, clientID, clientSecret, userID,
}) => {
  const _url = url || `https://api.vimeo.com/users/${userID}/videos?per_page=100`;
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
};

const parseVideos = (video) => {
  const videoThumbnail = video.pictures.uri
    .match(/\/pictures\/\w+/gi)[0]
    .replace(/\/pictures\//gi, '');
  const videoThumbnailUrl = `https://i.vimeocdn.com/video/${videoThumbnail}`;
  const authorThumbnail = video.user.pictures.uri
    .match(/\/pictures\/\w+/gi)[0]
    .replace(/\/pictures\//gi, '');
  const authorThumbnailUrl = `https://i.vimeocdn.com/portrait/${authorThumbnail}`;

  return {
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
    author: {
      name: video.user.name,
      url: video.user.link,
      bio: video.user.bio,
      thumbnail: {
        small: `${videoThumbnailUrl}_72x72.jpg`,
        medium: `${videoThumbnailUrl}_144x144.jpg`,
        large: `${videoThumbnailUrl}_288x288.jpg`,
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
