const { Markup, Scenes } = require('telegraf')
//данные для подключения к bd
const mysql = require('mysql')
const config = require('config')

//Возвращаем объект для подключения к bd
const connection = require("../bd/db_connection")

function newlink(id) {
    if(isNaN(id)) {
        return link = `https://steamcommunity.com/id/${id}`;
    }

    return link = `https://steamcommunity.com/profiles/${id}`;
}

function auth(id) {

    const sql = `SELECT * FROM users WHERE idTelegram = ${id}`;

    return new Promise(function(resolve){
        connection.query(sql, function(err, results) {
            if(err) console.log(err);

            if(results.length == 0) {
                // console.log('да таких нет');
                setTimeout(() => {
                    return resolve(true);
                })
            } else {
                // console.log('да такиe есть');
                setTimeout(() => {
                    return resolve(false);
                })
            }
        })
    })
}

class SceneAddSteamid {
    GenIdScene () {
        const genId = new Scenes.BaseScene('genId')
        genId.enter((ctx) => {
            ctx.session.idTelegram = ctx.scene.state.idTelegram
            ctx.scene.enter('age', {idTelegram: ctx.session.idTelegram})
        })

        return genId
    }

    GenAgeScene () {
        const age = new Scenes.BaseScene('age')
        age.enter((ctx) => {
            auth(ctx.session.idTelegram).then((data) => {
                if (data) {
                    ctx.reply('Укажите свой steam id')
                    ctx.scene.enter('name')
                } else {
                    ctx.reply('Вы уже авторизированны')
                    ctx.scene.leave()
                }
            })
        })
        return age
    }

    GenNameScene () {
        const name = new Scenes.BaseScene('name')
        name.on('text', (ctx) => {
            ctx.session.data = ctx.message;

            console.log(ctx.message)
            ctx.reply(`Это вы? \n ${newlink(ctx.message.text)}`, Markup.inlineKeyboard([
                [Markup.button.callback('Да', 'Yes'), Markup.button.callback('Нет', 'No')],
                [Markup.button.callback('Выйти', 'Exit')]
            ]))
        })

        name.action('No', (ctx) => {
            return ctx.scene.enter('age'); //делаем переход в начало сцены
        });
        
        name.action('Yes', (ctx) => {
                ctx.reply('Вы авторизированы');

                //Записть в бд
        
                //----Начало-----
                const sql = `INSERT INTO users(idTelegram, id_chat_telegram, idSteam, userName) VALUES("${ctx.session.data.from.id}", "${ctx.session.data.chat.id}", "${ctx.session.data.text}", "${ctx.session.data.from.username}")`;
        
                connection.query(sql, function(err, results) {
                    if(err) console.log(err);
                    console.log(results);
                })
                //----Конец-----
                
                return ctx.scene.leave(); //выход из сцены
        });
        
        name.action('Exit', (ctx) => {
            ctx.reply('Как хотите :)');
            return ctx.scene.leave(); //выход из сцены
        });

        return name
    }
}

module.exports = SceneAddSteamid