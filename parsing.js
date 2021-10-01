const fs = require('fs')

const puppeteer = require('puppeteer')

let id = '76561198095063504';

(async () => {
    let games = []

    try {
        let browser = await puppeteer.launch({
            headless: false,
            slowMo:100,
            devtools: true
        })

        let page = await browser.newPage()

        await page.setViewport({
            width:1980,
            height:10000
        })

        await page.goto(`https://store.steampowered.com/wishlist/profiles/${id}/#sort=order`)

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
        
        //что запихнуть ее в глобальную и потом вернуть
        await games.push(html)

        //вывожу что в переменной, после выполнения метода
        console.log(html)

    } catch(e) {
        console.log(e)
        await browser.close()
    }

})();