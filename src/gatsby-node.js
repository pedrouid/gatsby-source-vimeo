const axios = require('axios')


const getVideos = ()

exports.sourceNodes = async ({ boundActionCreators }, { clientID, clientSecret, userID }) => {
  const { createNode } = boundActionCreators;
  // Create nodes here, generally by downloading data
  // from a remote API.
  const data = await getVideos(REMOTE_API);

  // Process data into nodes.
  data.forEach(datum => createNode(processDatum(datum)));

  // We're done, return.
  return;
};
