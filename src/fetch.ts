import axios from 'axios';

/**
 * Calls the endpoint with authorization bearer token.
 * @param {string} endpoint
 * @param {string} accessToken
 */
export async function callApi(endpoint, accessToken) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  console.log('request made to web API at: ' + new Date().toString());

  const response = await axios.get(endpoint, options);
  return response.data;
}

module.exports = {
  callApi: callApi,
};
