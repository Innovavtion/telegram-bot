const { Scenes, session, Telegraf, Markup } = require('telegraf')
const config = require('config')

//токен
const bot = new Telegraf(config.get('token'))

//Сцены
//----- Добавление steam id ------
const addId = require("./telegram_scenes/addId")
const addSteamScene = new addId()
const addIdSteam1 = addSteamScene.GenIdScene()
const addIdSteam2 = addSteamScene.GenAgeScene()
const addIdSteam3 = addSteamScene.GenNameScene()

//----- Изменение steam id -----
const changeId = require("./telegram_scenes/changeId.js")
const changeSteamScene = new changeId()
const changeIdSteam1 = changeSteamScene.changeIdScene()
const changeIdSteam2 = changeSteamScene.changeIdSteam()

//----- Удаление steamm id -----
const deleteId = require("./telegram_scenes/deleteId.js")

//----- Просмотр steam id -----
const checkId = require("./telegram_scenes/checkId.js")
const checkSteamScene = new checkId()
const checkIdSteam = checkSteamScene.CheckIdScene()

//----- Просмотр рандомной игры -----
const randomGame = require("./telegram_scenes/randomGame.js")
const gameScene = new randomGame()
const game1 = gameScene.checkAuthScene()
const game2 = gameScene.randomGameScene()

//Для разных интервалов
const helloInterval = require("./custom_module/send_chat_content.js")

//Просмотр логов
bot.use(Telegraf.log())

//Массив вызываемых сцен
const stage = new Scenes.Stage([addIdSteam1, addIdSteam2, addIdSteam3, changeIdSteam1, changeIdSteam2, deleteId, checkIdSteam, game1, game2])
bot.use(session())
bot.use(stage.middleware())

//Команды вызывающие сцены
//----- Добавление steam id -----
bot.command('addId', ctx => {
    ctx.scene.enter('genId', {idTelegram: ctx.message.from.id})
})

//----- Изменеие steam id -----
bot.command('changeId', ctx => { 
    ctx.scene.enter('changeId', {idTelegram: ctx.message.from.id})
})

//----- Удаление steam id -----
bot.command('deleteId', ctx => ctx.scene.enter('deleteId'))

//-----Просмотр id и профиля -----
bot.command('checkId', ctx => {
    ctx.scene.enter('checkId', {idTelegram: ctx.message.from.id})
})

//----- Вывод одной рандомной игры -----
bot.command('randomGame', ctx => {
    ctx.scene.enter('checkAuth', {idTelegram: ctx.message.from.id})
})

bot.start(async (ctx) => {
    try {
        await ctx.reply(`Привет ${ctx.from.first_name}!!! \nВведи команду /help чтобы узнать какие команды есть`)
    } catch (e) {
        console.log(e)
    }
})

setInterval(() => {
    helloInterval.sendInterval(bot)
}, 60000)

bot.help(async (ctx) => {
    ctx.replyWithHTML(`
    \n🤖Команды бота:
/addId - Добавить steam id
/deleteId - Удалить steam id
/changeId - Изменить steam id
/checkId - Посмотреть свой профиль и id
/randomGame - Получить рандомную игру из списка желаемых
`)
})

bot.launch()