const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const TOKEN = "7465181661:AAFi1yZJTivlA_YMBSHeetaVjlcKGm4Uay4";
const server = express();

const port = process.env.PORT || 5000;
const gameName = "HareTest";
const queries = {};

server.use(express.static(path.join(__dirname, 'public')));

// const {Telegraf} = require("telegraf");

// var bot = new Telegraf(TOKEN);
// bot.use(Telegraf.log());
// const  pathUrl = bot.secretPathComponent();
// bot.telegram.setWebhook(`${"https://dmitryivanovdeveloper.github.io/HareWeb/"}/${pathUrl}`);

// server.use(bot.webhookCallback(`/${pathUrl}`));
// bot.start(ctx => ctx.replyWithGame("https://dmitryivanovdeveloper.github.io/HareWeb"));
// bot.gameQuery(ctx => ctx.answerGameQuery("https://dmitryivanovdeveloper.github.io/HareWeb"));




const compression = require('compression');
const fs = require('fs');

// Настройка компрессии
server.use(compression());

// Middleware для обработки Brotli файлов
server.use((req, res, next) => {
    console.log(req.headers);
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('br')) {
        const brFilePath = path.join(__dirname, 'public', req.url + '.br');
        if (fs.existsSync(brFilePath)) {
            req.url += '.br';
            res.set('Content-Encoding', 'br');
            res.set('Content-Type', 'application/javascript'); // Установите нужный тип контента
        }
    }
    next();
});





const bot = new TelegramBot(TOKEN, {
    polling: true
});
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "Say /start_game if you want to play."));
bot.onText(/start_game/, (msg) => bot.sendGame(msg.from.id, gameName));
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, {text: 'Plase try again', show_alert: true});
        queries[query.id] = query;
        let gameurl = "https://dmitryivanovdeveloper.github.io/HareWeb/";
        bot.answerCallbackQuery(query.id, {text: 'Your message', url: gameurl});
    }
});
bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: gameName
    }]);
});

server.get("/highscore/:score", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options,
        function (err, result) {});
});
server.listen(port);