const puppeteer = require('puppeteer');

// let id = '76561198095063504';
// let id = 'ventrexian';
// let id = 'daypirate';
// let id = 'gndfkgdkfgert89654iyo4y;trf'

class Profile {
    linkFormation = async (idUser) => {
        try {
            //Запуск экземпляра браузера
            const browser = await puppeteer.launch({
                headless: true,
                devtools: true,
            })
    
            //Открытие or Создание страницы
            const pageLinkCheck = await browser.newPage();
            let link;
            let linkTrue = false;
            
            pageLinkCheck.waitForSelector('div.wishlist_header')
            .then(() => {
                linkTrue = link;
                // console.log('Есть такой пользователь');
            }).catch(e => {
                // console.log('Нет такого пользователя');
            })

            for (link of [
                `https://store.steampowered.com/wishlist/id/${idUser}/#sort=order`,
                `https://store.steampowered.com/wishlist/profiles/${idUser}/#sort=order`
            ]) {
                //Открываем ссылку и ждем 1500ms на download
                await pageLinkCheck.goto(link);
                await pageLinkCheck.waitForTimeout(1000);
            }
   
            return new Promise((resolve) => {
                browser.close();
                // console.log(linkTrue);
                resolve(linkTrue);
            })

        } catch (e) {
            console.log(e);
        }
    };

    checkAkk = (link) => {
        if(link == false) {

            let data = {
                OpenProfile: 'Такого аккаунта нет'
            };

            return data;
        } else {

            let data = {
                OpenProfile: true,
                Userlink: link,
            };

            return data;
        }
    };
    
    checkLock = async (link) => {
        try {
            //Запуск экземпляра браузера
            const browser = await puppeteer.launch({
                headless: true,
                devtools: true
            })
            
            //Открытие or Создание страницы
            const pageLockCheck = await browser.newPage(); 
            await pageLockCheck.goto(link);
            await pageLockCheck.waitForSelector("div.wishlist_row");
    
            let result = await pageLockCheck.evaluate(() => {
                let el = document.querySelector("div.wishlist_row");
                return el ? true : false;
            })

            let data = {
                OpenProfile: result,
                Userlink: link,
            }

            // console.log(data)
            browser.close();

            return data;
        } catch (e) {
            console.log(e);
        }
    };
}

// Profile_User = new Profile()

// Profile_User.checkAkk(id)

module.exports = Profile