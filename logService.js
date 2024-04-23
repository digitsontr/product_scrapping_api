const fs = require('fs');

const LOG_SERVICE = {
    logFailedProducts: (logInfo) => {
        fs.readFile('./failedProductsLog.json', 'utf8', (err, data) => {
            if (err) {
                return;
            }
    
            let json = JSON.parse(data);
    
            json.push(logInfo);
    
            fs.writeFile('failedProductsLog.json', JSON.stringify(json,null,4), 'utf8', (err) => {
                if (err) {
                  return;
                }
              });
        });
    }
}
 

module.exports = LOG_SERVICE;