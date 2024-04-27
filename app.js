const express = require('express');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const helperService = require('./helperService.js')
const config = require('./config.js');
const fs = require('fs');
const axios = require('axios');


const app = express();

let siteConfig = {};
let searchText = '';

async function openWebPageUsingPuppeteer(productList = [], functionType, siteUrl = `${siteConfig.searchUrl}${searchText}`) {
    const browser = await puppeteer.launch({
        headless: "new"
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent(siteConfig.ajaxOptions.userAgent);

        await page.goto(siteUrl);

        console.log("Site url : ", siteUrl);

        //await page.setViewport({width: 1080, height: 1024});

        //await page.waitForTimeout(5000);

        const htmlContent = await page.content();
        const productContainer = siteConfig.selectors.productContainer;

        console.log("Product Container : ", productContainer);

        console.log("CONTENT : ", htmlContent.indexOf(productContainer));

        if (functionType === 'getProductInformation') {
            let $ = cheerio.load(htmlContent);

            //await page.waitForSelector('div.plp-item.product-item', { timeout: 60000 }); // Süreyi 60 saniyeye çıkardık

            var product = {
                name: siteConfig.functions.getName(productContainer, $),
                price: siteConfig.functions.getPrice(productContainer, $),
                originalPrice: siteConfig.functions.getOriginalPrice(productContainer, $),
                url: siteUrl,
                image: siteConfig.functions.replaceImage(siteConfig.functions.getImage(productContainer, $)),
                description: siteConfig.functions.getDescription(productContainer, $)
            }

            console.log("PRODUCT : ", product);

            return product;
        } else {
            return await getProductUrls(htmlContent, productList);
        }       
    } catch (err) {
        console.log(err);
    } finally {
        await browser.close();
    }
}

async function openWebPageFromAxios(productList = [], functionType, siteUrl = `${siteConfig.searchUrl}${searchText}`) {
    const response = await axios.get(siteUrl, {
        "headers": {
            "cookie": siteConfig.ajaxOptions.cookie,
            "user-agent": siteConfig.ajaxOptions.userAgent
        }
    });

    console.log("RESPONSE : ", response.data.indexOf("plp-item.product-item"));

    if (functionType === 'getProductInformation') {
        let $ = cheerio.load(response.data);
        const productContainer = siteConfig.selectors.productMainContainer;

        var oneProductFromHtml = {
            name: siteConfig.functions.getName(productContainer, $),
            price: siteConfig.functions.getPrice(productContainer, $),
            originalPrice: siteConfig.functions.getOriginalPrice(productContainer, $),
            url: siteUrl,
            image: siteConfig.functions.replaceImage(siteConfig.functions.getImage(productContainer, $)),
            description: siteConfig.functions.getDescription(productContainer, $)
        }

        //console.log("ONE PRODUCT FROM HTML : ", oneProductFromHtml);

        return oneProductFromHtml;
    } else {
        fs.writeFileSync('output.html', response.data, 'utf-8');
        return await getProductUrls(response.data, productList);
    }
}

const getProductUrls = async (htmlContent, productUrls = []) => {
    let $ = cheerio.load(htmlContent);

    //console.log("$ : ", $.html().indexOf("product-iteM"));

    const productContainers = $(siteConfig.selectors.productContainer);

    console.log("33333222222 : ", productContainers.length);

    $(siteConfig.selectors.productContainer).each((index, productContainer) => {
        let productUrl = siteConfig.functions.getUrl(productContainer, $);

        if (productUrl !== '' && productUrl.indexOf('http') !== 0) {
            if (productUrl.indexOf('/') !== 0) {
                productUrl = '/' + productUrl;
            }

            productUrl = siteConfig.siteOrigin + productUrl;
        }

        console.log("PROD URL : ", productUrl);

        productUrls.push(productUrl);
    });

    if (siteConfig.functions.hasPagination($)) {
        //console.log("5555555555555");

        searchText = helperService.getNextPage(searchText, siteConfig.paginationParamater);

        if (siteConfig.requestType === 'puppeteer') {
            return await openWebPageUsingPuppeteer(productUrls)
        } else {
            return await openWebPageFromAxios(productUrls)
        }
    }

    console.log("productUrls : ", productUrls);

    return productUrls.filter(Boolean);
}

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/api/stores', async (req, res) => {
    const storeList = config.sites.map((site) => {
        return {
            name: site.name,
            webPage: site.siteOrigin
        };
    })

    res.send(storeList);
});

app.get('/api/getProductList/:storename', async (req, res) => {
    siteConfig = config.sites.map((site) => {
        return site.name === req.params.storename && site;
    }).filter(Boolean)[0] || {};

    searchText = req.query.searchText;

    let productList = [];
    let productUrls = [];

    console.log("request type : ", siteConfig.requestType);

    if (siteConfig.requestType === 'puppeteer') {
        productUrls = await openWebPageUsingPuppeteer() || [];
    } else {
        productUrls = await openWebPageFromAxios() || [];
    }

    //console.log("productUrls : ", productUrls);

    try {
        for (const productUrl of productUrls) {
            try {
                let productInfo = {};

                if (siteConfig.requestType === 'puppeteer') {
                    productInfo = await openWebPageUsingPuppeteer([], 'getProductInformation', productUrl);
                } else {
                    productInfo = await openWebPageFromAxios([], 'getProductInformation', productUrl);
                }

                productInfo.price > 0 && productList.push(productInfo);
            } catch (error) {
                console.error('İstek hatası:', error);
            }
        }

        if (productList.length > 0) {
            fs.writeFileSync('ProductList.json', productList, 'utf-8');
        } else {   
            console.log("liste boş");

            const productListFromFile = fs.readFileSync('ProductList.json', 'utf-8');
            productList = JSON.parse(productListFromFile);
        }
    } catch (err) {
        console.log("err: ", err);
    } finally {
        res.send(productList);
    }
});

app.listen(config.port, () => {
    console.log(`Server çalışıyor: http://localhost:${config.port}`);
});