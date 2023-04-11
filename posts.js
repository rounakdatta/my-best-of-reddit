const fetch = require('node-fetch')

// this function uses an API to fetch the recent (max 25) upvotes
// TODO: figure out how to fetch the remaining upvotes in a paginated way
async function fetchUpvotedPostsBlob(username, accessToken) {
    const url = `https://oauth.reddit.com/user/${username}/upvoted`;
    const authenticationHeader = `bearer ${accessToken}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': authenticationHeader
        }
    })

    if (!response.ok) {
        throw new Error(`HTTP request for fetching upvoted posts failed with status code ${response.status}`)
    }

    const responseBody = await response.json()
    return responseBody
}

async function getUpvotedPosts(username, accessToken) {
    const upvotedPostsBlob = await fetchUpvotedPostsBlob(username, accessToken);
    const listOfPosts = []
    upvotedPostsBlob.data.children.forEach(upvotedElement => {
        listOfPosts.push({
            'subreddit': upvotedElement.data.subreddit,
            'postId': upvotedElement.data.id
        })
    });

    return listOfPosts
}

module.exports = getUpvotedPosts;
