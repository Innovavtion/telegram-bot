const mysql = require('mysql')
const config = require('config')
const _ = require('lodash');
const time = require('moment')

const connection = require("../bd/db_connection")

const parsing = require("../steamparsing/steam_parsing")
const randomSteamGame = new parsing()

function sendParsingGame(bot) {
    connection.query("SELECT * FROM users",function (err,res) {
        res.forEach(function (message) {
           console.log(message)
           //Первым аргументом кидаем chat.id

           showGameScene(message.idSteam, message.id, message.id_chat_telegram, bot)
        })
    })
}

function showGameScene(steamId, idBdUser, idChatTelegram, bot) {
    randomSteamGame.data(steamId)
    .then(data => {

        setTimeout(() => {

            if(typeof data === "string") {

                bot.telegram.sendMessage(idChatTelegram, data)

            } else {

                generateInformationGame(data, idBdUser).then((content) => {
                    if(typeof content == "string"){
                        bot.telegram.sendMessage(idChatTelegram, content)
                    } else {
                        bot.telegram.sendMessage(idChatTelegram, content.link)
                    }
                })
                    
            }
                            
        }, data)

    })
}

function checkSelectedGame(idBdUser) {

    const sql = `SELECT * FROM games_life, games WHERE games_life.id_user = ${idBdUser} AND games_life.id_game = games.id_game`

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, results) {
            if(err) console.log(err);

            resolve(results)

            reject('Сломалась функция checkSelectedGame в randomGame.js')
        });
    })
}

function AddGameInBd(data, idBdUser) {

    //Добавить игру в таблицу games
    const sql1 = `INSERT INTO games(name_game, url_game) VALUES("${data.title}", "${data.link}")`;

    connection.query(sql1, function(err, results) {
        // console.log(results)

        if(err) console.log(err)

        //Поучить id игры добавленной в games
        const sql2 = `SELECT * FROM games WHERE id_game=LAST_INSERT_ID()`;

        connection.query(sql2, function(err, results2) {
            console.log(results2[0].id_game)

            if(err) console.log(err)

            let start = time().add(1, 'days').format('YYYY-MM-DD')

            console.log(start)

            const sql3 = `INSERT INTO games_life(id_user, id_game, time_end_discount) VALUES("${idBdUser}", "${results2[0].id_game}", "${start}")`

            connection.query(sql3, function(err, results) {
                // console.log(results)
                if(err) console.log(err)
            })
        })
    })
}

function generateInformationGame(games, idBdUser) {

    return new Promise(function(resolve) {
        let game = checkSelectedGame(idBdUser).then((data) => {
            setTimeout(() => {
                
                    let gamesShow = [];
    
                    data.forEach(function(item) {
                        gamesShow.push({
                            title: item.name_game
                        })
                    })
    
                    let select = _.differenceBy(games, gamesShow, 'title');
    
                    if(select.length == 0) {

                        game = 'Нет больше игр по скидке'
    
                        resolve(game)
                    } else {
                        AddGameInBd(select[0], idBdUser);
    
                        game = select[0]
    
                        resolve(game)
                    }
    
            }, data);
        })
    })
}



module.exports.sendInterval = sendParsingGame