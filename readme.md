# gzip-webpack-plugin

Gzip compress the  output files.

Install
---
```
npm install @voyo/gzip-webpack-plugin --save-dev
```

Usage
---
webpack.config.js
```js
plugins:[
    //Files in all formats will be gzip compress 
    new require("@voyo/gzip-webpack-plugin").GzipWebpackPlugin(),
    //or...
    //Only files with js,css,html suffixes are gzip compress.
    new require("@voyo/gzip-webpack-plugin").GzipWebpackPlugin({
       extList:["js","css","html"]
    })
]
```

Options
---
- **extList**: string[] `optional` 

Specify the suffix name of the file to be compressed..
All files will be compressed if not specified.
- **outputPath**: string `optional` 

equiv `output.path`
