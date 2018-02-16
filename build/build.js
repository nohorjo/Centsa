const path = require('path');
const compressor = require('node-minify');

// Using Google Closure Compiler
compressor.minify({
    compressor: 'gcc',
    input: path.join(__dirname, '..', 'src', '*.js'),
    output: 'bar.js',
    callback: function (err, min) {
        if (err) throw err;
        console.log(min);
    }
});