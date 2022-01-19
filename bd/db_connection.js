//подлючениен к бд
const mysql = require('mysql')
const config = require('config')

//вызов метода и передача аргументов
const connection = mysql.createConnection({
  host: config.get('host'),
  post: config.get('post'),
  user: config.get('user'),
  database: config.get('database'),
  password: config.get('password'),
  insecureAuth : true
});

// Создание таблицы users
// const sql = `create table if not exists users(
//   id int primary key auto_increment,
//   idTelegram varchar(255) not null,
//   idSteam varchar(255) not null,
//   userName varchar(255) not null
// )`;
 
// connection.query(sql, function(err, results) {
//     if(err) console.log(err);
//     else console.log("Таблица создана");
// });

// const sql = ``;

// //Создание таблицы GameLife и связывание ее с таблицей users
// const sql = ``;

// connection.query(sql, function(err, results) {
//       if(err) console.log(err);
//       else console.log("Таблица создана");
// });

module.exports = connection