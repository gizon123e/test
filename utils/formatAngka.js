module.exports = function formatNumber(number) {
     try {
          let formatted = number.toFixed(3);
          
          formatted = formatted.replace(/(\.\d*?)0+$/, '$1');
          
          if (formatted.endsWith('.')) {
               formatted = formatted.slice(0, -1);
          }
          
          if (formatted.includes('.') && formatted.split('.')[1] === '000') {
               formatted = formatted.split('.')[0];
          }
          return parseFloat(formatted);
     } catch (error) {
          return new Error(error);
     }
}