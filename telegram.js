const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});

const processAllPendingPostsForUser = require('./processor.js')
const path = require('path');
const fs = require('fs');

// we create the directory first where the sqlite database would be stored
const databasePath = path.join(__dirname, "data");
if (!fs.existsSync(databasePath)) {
  fs.mkdirSync(databasePath, { recursive: true });
}

const db = require('better-sqlite3')(`${databasePath}/mybor.db`);
db.pragma('journal_mode = WAL');

const schedule = require('node-schedule');
const autoProcessingSchedule = process.env.AUTO_SCHEDULE;

db.exec("CREATE TABLE IF NOT EXISTS credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id TEXT UNIQUE, user_name TEXT, password TEXT, client_id TEXT, client_secret TEXT)");
// we keep it simple here, and not link them across via a foreign key
db.exec("CREATE TABLE IF NOT EXISTS processed_state (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id TEXT, post_id TEXT, processed BOOLEAN CHECK (processed IN (0, 1)))");

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome! Let's collect all your Reddit upvotes. Type /help to get started");
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "Type /authorize followed by your Reddit username, password, clientId and clientSecret. Each of them should be separated by a space");
});

bot.onText(/\/authorize/, (msg) => {
    const chatId = msg.chat.id.toString()
    // the first part of the message would be the `/authorize` command, so we need to skip that
    const credentials = msg.text.toString().split(" ").slice(1)
    if (credentials.length != 4) {
        bot.sendMessage(msg.chat.id, "The message was in a malformed format, please try again")
    } else {
        const db_row = {
            "chatId": chatId,
            "username": credentials[0],
            "password": credentials[1],
            "clientId": credentials[2],
            "clientSecret": credentials[3]
        }
        try {
            db.prepare("INSERT INTO credentials (chat_id, user_name, password, client_id, client_secret) VALUES (@chatId, @username, @password, @clientId, @clientSecret)").run(db_row);
            bot.sendMessage(msg.chat.id, "Ok, now use /getall anytime you want to receive your upvoted posts")
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
                bot.sendMessage(msg.chat.id, "Your credentials are already stored, use /clear if you want to reset them")
            } else {
                bot.sendMessage(msg.chat.id, "Sorry, an unexpected error occurred")
            }
        }
    }
});

bot.onText(/\/clear/, (msg) => {
    const chatId = msg.chat.id.toString()
    db.exec(`DELETE FROM credentials WHERE chat_id=${chatId};`)
    bot.sendMessage(msg.chat.id, "Credentials cleared");
});

// this is applicable when the user is explicitly requesting for all the posts
bot.onText(/\/getall/, (msg) => {
    const chatId = msg.chat.id.toString()
    const credentialsRow = db.prepare('SELECT * FROM credentials WHERE chat_id = ?').get(chatId);
    const credentials = {
        'clientId': credentialsRow.client_id,
        'clientSecret': credentialsRow.client_secret,
        'username': credentialsRow.user_name,
        'password': credentialsRow.password
    }

    bot.sendMessage(msg.chat.id, "Processing started");
    processAllPendingPostsForUser(chatId, credentials)
    .then(() => {
        const baseDirectory = path.join(__dirname, "data", chatId);
        const imageFiles = fs.readdirSync(baseDirectory);

        imageFiles.forEach(imgFileName => {
            const fullImgFileName = path.join(baseDirectory, imgFileName);
            bot.sendPhoto(msg.chat.id, fullImgFileName)
        });

        bot.sendMessage(msg.chat.id, "Your upvoted posts are ready!");
    })
});

// this is the scheduled function which only fetches the pending (unprocessed) posts
function processPendingCollection() {
    // (1) bring in the credentials of all the users we have in record
    const credentialsRows = db.prepare('SELECT * FROM credentials').all()
    credentialsRows.forEach(credentialsRow => {
        const chatId = credentialsRow.chat_id;
        const credentials = {
            'clientId': credentialsRow.client_id,
            'clientSecret': credentialsRow.client_secret,
            'username': credentialsRow.user_name,
            'password': credentialsRow.password
        }
        
        // fetch all the unfetched posts of that user
        processAllPendingPostsForUser(chatId, credentials)
        .then(() => {
            const baseDirectory = path.join(__dirname, "data", chatId);
            const imageFiles = fs.readdirSync(baseDirectory);
    
            imageFiles.forEach(imgFileName => {
                // we check if the particular image file has been processed or not
                const existsRow = db.prepare('SELECT * FROM processed_state WHERE chat_id = ? AND post_id = ?').get(chatId, imgFileName);
                // condition where the row doesn't exist or `processed` is FALSE
                if (!existsRow || existsRow.processed === 0) {
                    const fullImgFileName = path.join(baseDirectory, imgFileName);
                    bot.sendPhoto(chatId, fullImgFileName)
                    db.prepare('INSERT INTO processed_state (chat_id, post_id, processed) VALUES (?, ?, 1)').run(chatId, imgFileName);
                }
            });
    
            bot.sendMessage(chatId, "Your upvoted posts are ready!");
        });

    })
  }
  
// say '0 18 * * *' for everyday at 6pm
// say '*/5 * * * *' for every 5 minutes
const job = schedule.scheduleJob(autoProcessingSchedule, function() {
    processPendingCollection();
});
