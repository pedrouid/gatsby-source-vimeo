const axios = require('axios');
const axiosRetry = require('axios-retry');
const crypto = require('crypto');

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const { createRemoteFileNode } = require('gatsby-source-filesystem');

const getVideos = async ({
  url,
  clientID,
  clientSecret,
  userID,
  searchQuery,
  transformer,
}) => {
  try {
    const _searchQuery =
      searchQuery && searchQuery !== '' ? `&query=${searchQuery}` : '';
    const _url =
      url ||
      `https://api.vimeo.com/users/${userID}/videos?per_page=100${_searchQuery}`;
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
        transformer,
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

const parseVideos = async (video, transformer) => {
  const videoID = video.uri.replace('/videos/', '');
  const videoThumbnails = video.pictures.sizes

  const userID = video.uri.replace('/users/', '');
  let userThumbnailUrl;
  if (video.user.pictures.uri) {
    const userThumbnail = video.user.pictures.uri
      .match(/\/pictures\/\w+/gi)[0]
      .replace(/\/pictures\//gi, '');
    userThumbnailUrl = `https://i.vimeocdn.com/portrait/${userThumbnail}`;
  }

  const videoInfo = {
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
      small: videoThumbnails[2].link, // 2
      medium: videoThumbnails[3].link, // 3
      large: videoThumbnails[5].link, // 5
      hd: videoThumbnails[6].link, // 6
    },
    tags: video.tags,
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
      ...(userThumbnailUrl && {
        thumbnail: {
          small: `${userThumbnailUrl}_72x72.jpg`,
          medium: `${userThumbnailUrl}_144x144.jpg`,
          large: `${userThumbnailUrl}_288x288.jpg`,
        },
      }),
    },
  };

  return transformer && typeof transformer === 'function'
    ? transformer(videoInfo)
    : videoInfo;
};

const createImageNode = (createNodeId, createNode, store, cache) => url =>
  createRemoteFileNode({
    url,
    store,
    cache,
    createNode,
    createNodeId,
  });

exports.sourceNodes = async (
  {
    boundActionCreators, createNodeId, store, cache,
  },
  {
    clientID,
    clientSecret,
    userID,
    searchQuery,
    transformer,
    videoThumbnailNodeName = 'coverImage',
    userThumbnailNodeName = 'userImage',
  },
) => {
  const { createNode } = boundActionCreators;
  const createImage = createImageNode(createNodeId, createNode, store, cache);

  try {
    const videos = await getVideos({
      clientID,
      clientSecret,
      userID,
      searchQuery,
      transformer,
    });

    if (transformer && typeof transformer !== 'function') {
      console.error('[gatsby-source-vimeo] Key `transformer` should be of type `function`.');
    }

    let node;
    const allVideos = videos.map(async (video) => {
      const parsedVideo = await parseVideos(video, transformer);
      node = await createNode(parsedVideo);
      try {
        const coverNode = await createImage(parsedVideo.thumbnail.hd);
        const coverNodeLink = `${videoThumbnailNodeName}___NODE`;
        node = {
          ...node,
          [coverNodeLink]: coverNode.id,
        };
      } catch (e) {
        console.error(`Failed creating cover image ${parsedVideo.thumbnail.hd} for node: ${node.title}`);
        console.error(e);
      }
      if (parsedVideo.user.thumbnail) {
        try {
          const userNode = await createImage(parsedVideo.user.thumbnail.large);
          const userNodeLink = `${userThumbnailNodeName}___NODE`;
          node = {
            ...node,
            [userNodeLink]: userNode.id,
          };
        } catch (e) {
          console.error(`[gatsby-source-vimeo] Failed creating user image ${parsedVideo.user.thumbnail.large} for node: ${parsedVideo.user.name}`);
          console.error(e);
        }
      }
    });

    await Promise.all(allVideos);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
