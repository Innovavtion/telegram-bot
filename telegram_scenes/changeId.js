const { Markup, Scenes } = require('telegraf')

//данные для подключения к bd
const mysql = require('mysql')
const config = require('config')

//Возвращаем объект для подключения к bd
const connection = require("../bd/db_connection")

function auth(id) {

    const sql = `SELECT * FROM users WHERE idTelegram = ${id}`;

    return new Promise(function(resolve, reject){
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

class SceneChangeSteamid {
    changeIdScene() {
        const changeId = new Scenes.BaseScene('changeId')
        changeId.enter((ctx) => {
            auth(ctx.scene.state.idTelegram).then((data) => {
                if (!data) {
                    ctx.reply('Укажите свой steam id')
                    ctx.scene.enter('changeIdSteam')
                } else {
                    ctx.reply('Вы еще не авторизированны')
                    ctx.scene.leave()
                }
            })
        })

        return changeId
    }

    changeIdSteam() {
        const changeIdSteam = new Scenes.BaseScene('changeIdSteam')
        changeIdSteam.on('text', (ctx) => {
            ctx.session.data = ctx.message;

            console.log(ctx.message)

            ctx.reply(`Вы точно хотите?`, Markup.inlineKeyboard(
                [Markup.button.callback('Да', 'Yes'), Markup.button.callback('Нет', 'No')]
            ))
        })

        changeIdSteam.action('No', (ctx) => {
            ctx.reply('Ок бывает')
            return ctx.scene.leave(); //делаем переход в начало сцены
        });
        
        changeIdSteam.action('Yes', (ctx) => {
                ctx.reply('Вы изменили steam id');

                //Записть в бд
        
                //----Начало-----
                // const sql = `INSERT INTO users(idTelegram, idSteam, userName) VALUES("${ctx.session.data.from.id}", "${ctx.session.data.text}", "${ctx.session.data.from.username}")`;
                const sql = `UPDATE users SET idSteam=? WHERE idTelegram=?`;

                const data = [ctx.session.data.text, ctx.session.data.from.id]

                connection.query(sql, data, function(err, results) {
                    if(err) console.log(err);
                    console.log(results);
                })
                //----Конец-----
                
                return ctx.scene.leave(); //выход из сцены
        });

        return changeIdSteam
    }
}

//Экспорт модуля
module.exports = SceneChangeSteamid