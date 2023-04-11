const { getRedditAccessToken, getRedditCredentials } = require('./auth.js')
const getUpvotedPosts = require('./posts.js')
const downloadRedditPostAsImage = require('./shareddit.js')

async function main() {
    const accessToken = await getRedditAccessToken();

    // for fetching the upvoted posts, we need the username credential
    const credentials = await getRedditCredentials();

    // get the list of (subreddit, postId) of upvoted posts
    const listOfUpvotedPosts = await getUpvotedPosts(credentials.username, accessToken);

    listOfUpvotedPosts.forEach(async post => {
        await downloadRedditPostAsImage(post.postId, post.subreddit, accessToken);
    });
}

main()
