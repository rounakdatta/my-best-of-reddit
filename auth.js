const fetch = require('node-fetch')

// this function generates the short-lived access token from the fixed credentials
async function getRedditAccessToken() {
    const credentials = await getRedditCredentials();

    const url = 'https://www.reddit.com/api/v1/access_token';
    const body = `grant_type=password&username=${credentials.username}&password=${credentials.password}`;
    const basicAuth = `${credentials.clientId}:${credentials.clientSecret}`;
    const authenticationHeader = `Basic ${Buffer.from(basicAuth).toString('base64')}`;

    const response = await fetch(url, {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authenticationHeader
        }
    })

    // occasionally the endpoint throws 429 (too many requests)
    if (!response.ok) {
        throw new Error(`Access token request calling failed with status code ${response.status}`)
    }

    const responseBody = await response.json()
    return responseBody.access_token
}

async function getRedditCredentials() {
    return {
        'clientId': process.env.CLIENT_ID,
        'clientSecret': process.env.CLIENT_SECRET,
        'username': process.env.USERNAME,
        'password': process.env.PASSWORD
    }
}

module.exports = getRedditAccessToken;
