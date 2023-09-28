const puppeteer = require('puppeteer');
require("dotenv").config();

class CrawlerController {
    /**
     * Crawl detail page
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async crawlDetailPage(req, res, next) {
        
        // Launch the browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
      
        // Navigate the page to a URL
        await page.goto('https://ssports.iqiyi.com/news/67561020', {
            waitUntil: 'domcontentloaded', // Waiting write content
        });
    
        try {
            const elementTitle = await page.waitForSelector('.style_newsTitle_hc4');
            const title = await elementTitle.evaluate(el => el.textContent);

            const elementContent = await page.waitForSelector('.style_newsContent_1ph');
            const content = await elementContent.evaluate(el => el.textContent)

            const images = await page.$$('p > a') // Get multiple element in tagname
            const listImage = [];
            for (const image of images){
                const image_url = await page.evaluate(el => el.querySelector("img").getAttribute("src"), image);
                listImage.push(image_url);
            }
                
            var postItem = {
                "title": title,
                "content": content,
                "image": listImage,
            }
        } catch (error) {
            console.log(error);
        }
      
        await browser.close();

        res.json(postItem);
    }

    /**
     * Clawler 12 post on top page
     */
    async crawlMultiplePost(req, res, next){
        // Launch the browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
    
        // Navigate the page to a URL
        await page.goto('https://ssports.iqiyi.com', {
            waitUntil: 'domcontentloaded', // Waiting write content
            timeout: 0 
        });

        // Get list elements
        await page.waitForSelector('.style_list_2F4' , {  visible: true , timeout: 0 });
        const posts = await page.$$('.style_list_2F4');

        // get url post in firt page and push to array list
        const listUrl = [];
        for(const post of posts){
            try {
                const [url] = await Promise.all([
                    new Promise((resolve) => {
                    browser.once('targetcreated', (target) => { resolve(target.url()); });
                    }),
                    post.click(),
                ]);

                listUrl.push(url);

            } catch (error) {
                console.log(error);
            }
        }

        // Navigate the page detail by url and get content + image_url + title
        const listPost = [];
        for (let i = 0; i < listUrl.length; i++){
            try {
                const url = listUrl[i];     
                await page.goto(`${url}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 0
                });
                
                const elementTitle =  await page.waitForSelector('.style_newsTitle_hc4', {timeout: 5000});
                const title = await elementTitle.evaluate(el => el.textContent);

                const elementContent =  await page.waitForSelector('.style_newsContent_1ph', {timeout: 5000});
                const content =  await  elementContent.evaluate(el => el.textContent)

                // const elementImage =  await page.waitForSelector('p > a', {timeout: 5000});
                // const image =  await  elementImage.evaluate(el => el.getAttribute('href'))


                const images = await page.$$('p > a') // Get multiple element in tagname
                const listImage = [];
                for (const image of images){
                    const image_url = await page.evaluate(el => el.querySelector("img").getAttribute("src"), image);
                    listImage.push(image_url);
                }

                const postItem = {
                    "title": title,
                    "content": content,
                    "images_url": listImage
                }
                
                listPost.push(postItem);

            } catch (error) {
                console.log(error);
            }
        }    
        
        await browser.close();

        res.json({
            status: true,
            data: listPost
        });
    }
}

module.exports = new CrawlerController;