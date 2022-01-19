const { Markup, Scenes } = require('telegraf')
//данные для подключения к bd
const mysql = require('mysql')
const config = require('config')
const _ = require('lodash');
const time = require('moment')


const connection = require("../bd/db_connection")

//Вызов парсинга
//----- Вывод рандомной игры -----
const parsing = require("../steamparsing/steam_parsing")
const randomSteamGame = new parsing()

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

//выводит для пользователя данные об игре, вызвается парсинг
function showGameScene(steamId, idBdUser, ctx) {
    randomSteamGame.data(steamId)
    .then(data => {

        setTimeout(() => {

            if(typeof data === "string") {

                ctx.reply(data)

            } else {

                generateInformationGame(data, idBdUser).then((content) => {
                    if(typeof content == "string"){
                        ctx.reply(content)
                    } else {
                        ctx.reply(content.link)
                    }
                })
                    
            }
                            
        }, data)

    })
}

//Просмотр добавленых в бд игр для этого пользователя, если нет игры то вернет одну игру
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

//Добавление новой игры для этого пользователя в бд
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

//Формирование информации об игре для пользователя и вызов sql - request для добавления игры в бд
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

class SceneRandomGame {
    checkAuthScene() {
        const checkAuth = new Scenes.BaseScene('checkAuth')

        checkAuth.enter((ctx) => {
            auth(ctx.scene.state.idTelegram).then((data) => {
                if (!data) {
                    ctx.session.idTelegram = ctx.scene.state.idTelegram;
                    ctx.scene.enter('randomGame');
                } else {
                    ctx.reply('Вы еще не авторизированны')
                    ctx.scene.leave();
                }
            })
        })

        return checkAuth
    }

    randomGameScene() {
        const randomGame = new Scenes.BaseScene('randomGame')

        randomGame.enter((ctx) => {
            ctx.reply('Ожидайте...')

            //Используется при sql - запросе
            const idTelegram = ctx.session.idTelegram;

            //Дальше это надо забахать
            const sql = `SELECT * FROM users WHERE idTelegram = ${idTelegram}`;
  
            connection.query(sql, function(err, results) {
                if(err) console.log(err)

                //Добираемся до idSteam и присваиваем переменной steamId
                let steamId = results[0].idSteam

                let idBdUser = results[0].id;

                showGameScene(steamId, idBdUser, ctx)
            })

            ctx.scene.leave()
        })

        return randomGame
    }
}

module.exports = SceneRandomGame