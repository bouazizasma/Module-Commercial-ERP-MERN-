const path = require('path');

module.exports = {
  resolve: {
    alias: {
      'pdfjs-dist': path.resolve(__dirname, 'node_modules/pdfjs-dist'),
    },
  },
};