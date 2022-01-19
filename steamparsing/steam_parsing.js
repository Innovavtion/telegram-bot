const fs = require('fs')

const puppeteer = require('puppeteer')

// let id = 'daypirate';
// let games = [];

//работает но как-то не оч мне нравится
const newLink = require("./profile_definition")
const dataUser = new newLink()

class SteamParsing {
    //Жирная функция, но разминает голову неплохо :)
    data = (id) => dataUser
    .linkFormation(id)
    .then(link => {
        return dataUser.checkAkk(link);
    })
    .then(data => { 
        //Данные пришетшие от profile definition
        console.log(data);
        let games;

        if(data.OpenProfile === true) {
            //вызываем парсинг и запихиваем его в переменную
            games = this.parsing(data.Userlink);
        } else {
            if(data.OpenProfile == 'Такого аккаунта нет') {
                games = 'Такого аккаунта нет';
            } else {
                games = 'Ваш список желаемых закрыт, откройте если не сложно';
            }
        }

        //возвращаем промис, чтобы использовать в сцене
        return new Promise(function(resolve){   
            resolve(games);
        })
    });

    //сам парсинг списка желаемого
    parsing = async (link) => {

        try {
            let browser = await puppeteer.launch({
                //View browser
                headless: true,
                slowMo:100,
                devtools: true
            })
    
            let page = await browser.newPage()
    
            await page.setViewport({
                width:1980,
                height:10000
            })
            
            //вызываем внутри функцию для формирования ссылки
            await page.goto(link)
            
            //Сделать ожидание если нет то вернуть у вас закрыт список желаемых
            await page.waitForSelector('div.wishlist_row')
    
            let html = await page.evaluate(async () => {
                let page = []
    
                try {
                    let divs = document.querySelectorAll('div.wishlist_row')
    
                    console.log(divs)
    
                    divs.forEach(div => {
                        let a = div.querySelector('a.title')
    
                        if(div.querySelector('div.discount_pct')) {
    
                            let game = {
                                title: a.innerText,
                                link: a.href,
                                price: div.querySelector('div.discount_original_price').innerText,
                                price_discount: div.querySelector('div.discount_final_price').innerText,
                                discount: div.querySelector('div.discount_pct').innerText
                            }
        
                            page.push(game)
                        }
                    })
    
                } catch (e) {
                    console.log(e);
                }
    
                return page
            }, {waitUntil: 'div.wishlist_row'})
            
            await browser.close()
        
            if(html.length > 0) {
                //что запихнуть ее в глобальную и потом вернуть
                return await html;
            } else {
                return html = 'В вашем списке желаемых нет игр по скидке';
            }
     
        } catch(e) {
            console.log(e)
    
            await browser.close()
        }
    }
}

// SteamParsing1 = new SteamParsing()

// SteamParsing1.data(id)

module.exports = SteamParsing