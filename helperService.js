const logService = require('./logService.js')
const HELPER_SERVICE = {
    validateProductObject : (product, productInformation)=> {
        if(product.price <= 0 ||
             product.image === '' || product.name === '' || product.url.indexOf('undefined') !== -1){
            //logService.logFailedProducts(productInformation);
    
            return false;
        }
    
        product.originalPrice =  product.originalPrice || product.price;
        product.name = product.name.replace(/\s+/g, ' ');
    
        return product;
    },
    getNextPage: (url, paginationParamater, paginationSeperator = '&') => {
        let page = 0;
        
        if(url.indexOf(paginationParamater+'=') !== -1){
            page= parseInt(url.split(paginationParamater + '=').slice(-1)[0].split(paginationSeperator)[0]) + 1;
            return url.split(paginationSeperator +paginationParamater+'=')[0] + paginationSeperator +paginationParamater+'='+ page;
        }else{
            let newUrl = url + paginationSeperator +paginationParamater+'=2';
            return newUrl;
        }
    }
}


module.exports = HELPER_SERVICE;