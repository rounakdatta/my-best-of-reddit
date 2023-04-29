const { getRedditAccessToken } = require('./auth.js')
const getUpvotedPosts = require('./posts.js')
const downloadRedditPostAsImage = require('./shareddit.js')

async function processAllPendingPostsForUser(userId, credentials) {
    const accessToken = await getRedditAccessToken(credentials);

    // get the list of (subreddit, postId) of upvoted posts
    const listOfUpvotedPosts = await getUpvotedPosts(credentials.username, accessToken);

    const downloadPromises = listOfUpvotedPosts.map(async (post) => {
        await downloadRedditPostAsImage(userId, post.postId, post.subreddit, accessToken);
      });

      await Promise.all(downloadPromises)
      .then(() => {
        console.log("Finished downloading all the posts as images")
      })
}

module.exports = processAllPendingPostsForUser;
