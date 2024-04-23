const parsePrice = (stringPrice) => {
    let price = 0;

    stringPrice = (stringPrice || '').toString();
    price = stringPrice.replace(/[^0-9.,]/g, '');

    if (price.slice(-3).indexOf(',') !== -1) {
        price = parseFloat(stringPrice.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    } else if (price.slice(-3).indexOf('.') !== -1) {
        price = parseFloat(stringPrice.replace(/[^0-9.]/g, '')) || 0;
    } else {
        price = parseFloat(stringPrice.replace(/[^0-9]/g, '')) || 0;
    }

    return price;
};

const SITE_CONFIG = {
    port: 3000,
    sites: [
        {
            name: "auchan",
            searchUrl: "https://www.auchan.fr/recherche?text=",
            siteOrigin:'https://www.auchan.fr',
            requestType : 'axios',
            paginationParamater:'page',
            selectors: {
                productContainer: ".product-thumbnail",
                productMainContainer: ".main-wrapper.product",
            },
            functions: {
                getName: function(element, $) {
                    return $(element).find('.site-breadcrumb__title:first').text().trim();
                },
                getImage: function(element, $) {
                    return ($(element).find('.product-zoom__item img').attr('data-src') || '').split(',')[0] ||
                     $(element).find('.product-zoom__item img').prop('src') || '';
                },
                getPrice: function(element, $) {
                    return parsePrice($(element).find('.product-price:first').text());
                },
                getOriginalPrice: function(element, $) {
                    return parsePrice($(element).find('.product-price:first').text());
                },
                getUrl: function (element, $) {
                    return $(element).find('a.product-thumbnail__details-wrapper').prop('href') || '';
                },
                getDescription: function(element, $){
                    return $(element).find('.product-description__content-wrapper:first').html();
                },
                hasPagination: function($) {
                    const nextPage = $('.pagination-item.selected').next();
                    console.log('NEXT PAGE LENGTH', nextPage.length)
                    if (nextPage.length === 0) {
                        return false;
                    } else {
                        return true;
                    }
                },
                getNextPageUrl: function($){
                    const nextPage = $('.pagination-item.selected').next();
                    if (nextPage.length === 0) {
                        return false;
                    } else {
                        return (nextPage.attr('href') || '').split('?').slice(-1)[0];
                    }
                }, 
                replaceImage: function(image){
                    return image;
                }
            },
            ajaxOptions: {
                cookie: "lark-journey=f4d0b580-9a33-4713-9d49-5f5c6d903028"
            }
        }, {
            name: "carrefour",
            searchUrl: "https://www.carrefour.fr/s?q=",
            siteOrigin:'https://www.carrefour.fr',
            requestType : 'puppeteer',
            paginationParamater:'page',
            selectors:{
                productContainer: "li.product-grid-item article",
                productMainContainer: ".product-details"
            },
            functions:{
                getName: function(element, $){
                    return $(element).find('.product-title__title:first').text().trim()
                },
                getImage: function(element, $){
                    return ($(element).find('.pdp-hero__thumbs img').prop('src') ||
                     $(element).find('.pdp-hero__single-image-wrapper img').prop('src') || '').trim()
                },
                getPrice: function(element, $){
                    return parsePrice($(element).find('.product-price__amount-value:first').text().trim())
                },
                getOriginalPrice: function(element, $){
                    return parsePrice($(element).find('.product-price__amount-value:first').text().trim())
                },
                getUrl:function(element, $){
                    return $(element).find('a.product-card-image').prop('href') || ''
                }, 
                getDescription: function(element, $){
                    return $(element).find('[data-testid=product-characteristics-description]:first').html();
                },
                hasPagination: function($){
                    return $('.pagination__button-wrap button').length > 0;
                }, 
                getNextPageUrl: function($){
                    const nextPage = $('.pagination-item.selected').next();
                    if (nextPage.length === 0) {
                        return false;
                    } else {
                        return (nextPage.attr('href') || '').split('?').slice(-1)[0];
                    }
                },
                replaceImage: function(image){
                    return image.replace('/p_43x43','').replace('/p_540x540','').replace('p_200x200','')
                }
            },
            ajaxOptions:{
               userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            }
        },{
            name: "plein",
            searchUrl: "https://www.plein.nl/merken/",
            siteOrigin:'https://www.plein.nl',
            paginationParamater:'p',
            requestType : 'puppeteer',
            selectors:{
                productContainer: "div.product-preview",
                productMainContainer: "#product-page"
            },
            functions:{
                getName: function(element, $){
                    return $(element).find('.row h1:first').text().trim()
                },
                getImage: function(element, $){
                    return ($(element).find('#owl-product img').prop('src') || '').trim()
                },
                getPrice: function(element, $){
                    return parsePrice($(element).find('.product-price:first').text())
                },
                getOriginalPrice: function(element, $){
                    return parsePrice($(element).find('.product-recommended:first').text()) ||
                         parsePrice($(element).find('.product-price:first').text())
                },
                getUrl:function(element, $){
                    return $(element).find('a.product-preview__umbrella').prop('href') || ''
                },
                hasPagination: function($){
                    return $('.pagination .active').next().length > 0;
                }, 
                getDescription: function(element, $){
                    return $(element).find('.row div:first div:last').prev().html();
                },
                replaceImage: function(image){
                    return image.replace('300x300','1000x1000');
                }
            },
            ajaxOptions:{
               
            }
        }, {
            name: "collectandgo",
            searchUrl: "https://www.collectandgo.be/colruyt/nl/zoek?searchTerm=",
            siteOrigin:'https://www.collectandgo.be',
            requestType : 'puppeteer',
            paginationParamater:'page',
            selectors: {
                productContainer: "div.plp-item.product-item",
                productMainContainer: "div.plp-item.product-item"
            },
            functions:{
                getName: function(element, $){
                    return $(element).find('.c-product-name:first').text().trim().replace(/[\n\t]/g, " ")
                },
                getImage: function(element, $){
                    return ($(element).find('img.plp-item-top__image').attr('src') || "").trim()
                },
                getPrice: function(element, $){
                    return parsePrice($(element).find('.product__price__base-price:first').text().trim())
                },
                getOriginalPrice: function(element, $){
                    return parsePrice($(element).find('.product__price__base-price:first').text().trim())
                },
                getUrl:function(element, $){
                    return $(element).find('a.product-link').prop('href') || ''
                }, 
                getDescription: function(element, $){
                    return $(element).find('[data-testid=product-characteristics-description]:first').html() || "";
                },
                hasPagination: function($){
                    return $('.pagination__button-wrap button').length > 0;
                }, 
                getNextPageUrl: function($){
                    const nextPage = $('.pagination-item.selected').next();
                    if (nextPage.length === 0) {
                        return false;
                    } else {
                        return (nextPage.attr('href') || '').split('?').slice(-1)[0];
                    }
                },
                replaceImage: function(image){
                    return image.replace('/43x43','').replace('/540x540','').replace('200x200','')
                }
            },
            ajaxOptions:{
               userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            }
        }
    ]
};

module.exports = SITE_CONFIG;