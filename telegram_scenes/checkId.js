const { Markup, Scenes } = require('telegraf')
//данные для подключения к bd
const mysql = require('mysql')
const config = require('config')

const connection = require("../bd/db_connection")

function checkSteamProfile(idTelegram) {

    const sql = `SELECT * FROM users WHERE idTelegram = ${idTelegram}`;

    return new Promise(function(resolve) {
        connection.query(sql, function(err, results) {
            if(err) console.log(err);

            if(results.length != 0) {
                // console.log(results[0].idSteam)
                return resolve(results[0].idSteam)
            } else {
                return resolve(false)
            }
        })
    })
}

class SceneCheckIdSteam {
    CheckIdScene () {
        const checkId = new Scenes.BaseScene('checkId')

        checkId.enter((ctx) => {
            let idTelegram = ctx.scene.state.idTelegram

            checkSteamProfile(idTelegram).then((idSteam) => ctx.reply(`Ваш steamId: ${idSteam}`))

            ctx.scene.leave()
        })

        return checkId
    }
}

module.exports = SceneCheckIdSteam