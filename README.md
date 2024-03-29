# My Best of Reddit

<img src="assets/logo.png">

Get your upvoted posts and comments from Reddit delivered over Telegram.
- Preserve the gold you discover on the internet
- Make the text in the images searchable by uploading it to Google Photos or a similar OCR-supported platform

## Get started
To use the service, you can choose to use my hosted version [@MyBestOfRedditBot](https://t.me/MyBestOfRedditBot), or self-host it yourself. Self-hosting is recommended if you're paranoid about me storing your Reddit [^1] credentials and data.

Once on a chat with the bot,
- Use `/start` to get initial instructions
- Use `/authorize <>` to send in your credentials
- Use `/getall` to get all the images the application has retrieved so far
- Use `/clear` to delete your credentials from the application's database

Here is an example screenshot of how the screenshots look like (red-highlighted comments are upvoted):


<kbd> <img src="assets/example_post.png" width="400">  </kbd>

### Run it directly (not recommended, development only)
1. Use [@BotFather](https://t.me/BotFather) bot on Telegram to create your own bot credentials.
2. `npm install` to install dependencies.
3. `TELEGRAM_TOKEN="<>" AUTO_SCHEDULE="<>" node telegram.js` to run the application. The `AUTO_SCHEDULE` is a cron expression which determines at what interval posts get delivered automatically to the users of this bot. Example values are `0 18 * * *` (everyday at 6PM), `*/5 * * * *` (every 5 minutes).

### Run it containerized
You can build it from source as per your CPU arch
```sh
docker build -t my-best-of-reddit . --load
```
or pull the hosted version
```sh
docker pull rounakdatta/my-best-of-reddit
```

And then just run
```
docker run -e TELEGRAM_TOKEN="<>" -e AUTO_SCHEDULE="<>" my-best-of-reddit
```

When running in production mode, make sure to mount a persistent volume to the container path `/usr/src/app/data` where the database and all the post images would be stored. You can find a sample Nomad job specification [here](https://github.com/rounakdatta/homelab.setup/blob/main/roles/launch-nomad-jobs/templates/my_best_of_reddit.nomad.j2).

The application takes care of de-duplicating posts in scheduled sends, and doesn't send the same posts repeatedly. The state is stored in a SQLite database.

## Credits
- The heavylifting of generating a beautiful image of a Reddit post is the credit of the [Shareddit](https://github.com/logankuzyk/shareddit) project. For this application, I am using [my custom fork](https://github.com/rounakdatta/shareddit) which supports some additional functionalities atop that.
- The logo for the project was generated using [Gooey](https://gooey.ai) which is a cool platform for running Stable Diffusion Img2Img models.

[^1]: There is a saying that your Reddit account can say more about your personality that your Google account / something else ;)
