const axios = require('axios');

const getVideos = ({ clientID, clientSecret, userID }) => {
  const url = `https://api.vimeo.com/users/${userID}/videos`;
  return axios.get(url, {
    auth: {
      username: clientID,
      password: clientSecret,
    },
  });
};

exports.sourceNodes = async ({ boundActionCreators }, { clientID, clientSecret, userID }) => {
  const { createNode } = boundActionCreators;

  try {
    const data = await getVideos({ clientID, clientSecret, userID });

    const processDatum = datum => JSON.parse(datum);

    data.forEach(datum => createNode(processDatum(datum)));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
