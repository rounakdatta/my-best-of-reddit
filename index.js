const getRedditAccessToken = require('./auth.js')
const downloadRedditPostAsImage = require('./shareddit.js')

async function main() {
    const accessToken = await getRedditAccessToken()
    console.log(accessToken)

    downloadRedditPostAsImage('xxx', 'yyy', accessToken)
}

main()
