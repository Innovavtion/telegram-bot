const { Markup, Scenes } = require('telegraf')

//данные для подключения к bd
const mysql = require('mysql')
const config = require('config')

//Возвращаем объект для подключения к bd
const connection = require("../bd/db_connection")

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

const deleteId = new Scenes.BaseScene('deleteId');

deleteId.enter((ctx) => {
    ctx.session.data = ctx.message;

    auth(ctx.session.data.from.id).then((data) => {
        console.log(data)
        if (!data) {
            ctx.reply(`Вы точно хотите выйти?`, Markup.inlineKeyboard(
                [Markup.button.callback('Да', 'Yes'), Markup.button.callback('Нет', 'No')]
            ))//Ответит в зависимости, что нажал пользователь
        } else {
            ctx.reply('Вы еще неавторизированны')
            ctx.scene.leave()
        }
    })
});

deleteId.action('No', (ctx) => {

    ctx.reply('Бывает ^)');

    return ctx.scene.leave(); //делаем переход в начало сцены

});

deleteId.action('Yes', (ctx) => {
    try {

        ctx.reply('Вы вышли');

        //Удаление из бд

        //----Начало-----

        const sql = "DELETE FROM users WHERE idTelegram=?";

        const idTelegram = ctx.session.data.from.id
        connection.query(sql, idTelegram, function(err, results) {
            if(err) console.log(err)
            console.log(results)
        })

        //----Конец-----

        return ctx.scene.leave(); //выход из сцены

    } catch (e) {
        console.log(e)
    }

    return ctx.scene.leave(); //выход из сцены
});

//Экспорт модуля
module.exports = deleteId