# My Best of Reddit

<img src="assets/logo.png">

Get your upvoted posts and comments from Reddit delivered over Telegram.
- Preserve the gold you discover on the internet
- Make the text in the images searchable by uploading it to Google Photos or a similar OCR-supported platform

## Get started
To use the service, you can choose to use my hosted version [@MyBestOfRedditBot](t.me/MyBestOfRedditBot), or self-host it yourself. Self-hosting is recommended if you're paranoid about me storing your Reddit [^1] credentials.

### Run it containerized
_Would be adding a Dockerfile soon_

### Run it directly (not recommended, development only)
1. Use [@BotFather](https://t.me/BotFather) bot on Telegram to create your own bot credentials.
2. `npm install` to install dependencies.
3. `TELEGRAM_TOKEN="<>" AUTO_SCHEDULE="<>" node telegram.js` to run the application. The `AUTO_SCHEDULE` is a cron expression which determines at what interval posts get delivered automatically to the users of this bot. Example values are `0 18 * * *` (everyday at 6PM), `*/5 * * * *` (every 5 minutes).

The application takes care of de-duplicating posts, and doesn't send the same posts repeatedly. The state is stored in a SQLite database.

## Credits
- The heavylifting of generating a beautiful image of a Reddit post is the credit of the [Shareddit](https://github.com/logankuzyk/shareddit) project. For this application, I am using [my custom fork](https://github.com/rounakdatta/shareddit) which supports some additional functionalities atop that.
- The logo for the project was generated [Gooey](https://gooey.ai) which is a cool platform for running Stable Diffusion Img2Img models.

[^1]: There is a saying that your Reddit account can say more about your personality that your Google account / something else ;)
