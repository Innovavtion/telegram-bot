const { Scenes, session, Telegraf, Markup } = require('telegraf')
const config = require('config')

//подлючениен к бд
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: "localhost",
  post: "3306",
  user: "root",
  database: "nodesb",
  password: "639s1753S",
  insecureAuth : true
})

const bot = new Telegraf(config.get('token'))

//Добавление сцены
// const SceneGenerator = require('./Telegram_scenes/Scenes')
// const curScene = new SceneGenerator()
// const ageScene = curScene.GenAgeScene()
// const nameScene = curScene.GenNameScene()

bot.use(Telegraf.log())

//Инлайновые кнопки
const inline_keyboard = Markup.inlineKeyboard([
    Markup.button.callback('Изменить все', 'updateScenes'),
    Markup.button.callback('Изменить возраст', 'updateScenesAge'),
    Markup.button.callback('Изменить имя', 'updateScenesName'),
])

bot.hears('🔍 Search', ctx => ctx.reply('Yay!'))
bot.hears('📢 Ads', ctx => ctx.reply('Free hugs. Call now!'))

bot.command('custom', async (ctx) => {
    return await ctx.reply('Custom buttons keyboard', Markup
      .keyboard([
        ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
        ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
        ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
      ])
      .oneTime()
      .resize()
    )
  })
  
bot.hears('🔍 Search', ctx => ctx.reply('Yay!'))
bot.hears('📢 Ads', ctx => ctx.reply('Free hugs. Call now!'))

//проверка на работу базы данных
bot.command('bd', async (ctx) => {
  const sql = `SELECT * FROM user`;
 
  connection.query(sql, function(err, results) {
    if(err) console.log(err);
    const users = results;
    for(let i=0; i < users.length; i++){
      ctx.reply(`name: ${users[i].name} and id: ${users[i].idUser}`)
    }
});
})

//добавление сцен в ctx
// const stage = new Scenes.Stage([ageScene, nameScene])

bot.use(session())
// bot.use(stage.middleware())

bot.start((ctx) => {
    ctx.reply(`Welcome ${ctx.from.first_name} to my secret shop \nНапиши /help чтобы узнать все команды`);
})

bot.help((ctx) => {
    ctx.reply(`
    Привет, ${ctx.from.first_name}!!! \n🤖Команды бота:
     /start - выводит Welcome
     /scenes - начать сцену где спросять возраст и имя
     /infoUser - показывает как тебя зовут и сколько тебе лет
     Также можно отправить стикер, ответит 👍
     Можно написать текст hi
    `)
})

bot.command('scenes', async (ctx) => {
    ctx.reply('Сколько тебе лет?')
    //вызов сцены age
    ctx.scene.enter('age')
})

//прослушивание data и в зависимости от даты вызов сцены
bot.action('updateScenes', async (ctx) => {
    ctx.reply('Изменение лет')

    ctx.scene.enter('age')
})

bot.action('updateScenesName', async (ctx) => {
    ctx.reply('Изменение имени')

    ctx.scene.enter('name')
})

bot.action('updateScenesAge', async (ctx) => {
    ctx.reply('Изменение лет')

    ctx.scene.enter('age')
})

bot.command('infoUser', (ctx) => {
    ctx.reply(`Твое имя ${ctx.session.name}!!! \nтебе ${ctx.session.age} лет`)
    ctx.reply('Custom buttons keyboard', Markup
      .keyboard([
        ['📚 Изменить имя'], // Row1 with 2 buttons
        ['☸ Setting'], // Row2 with 2 buttons
        ['📢 Ads'] // Row3 with 3 buttons
      ])
      .oneTime()
      .resize()
    )
})

bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.launch()