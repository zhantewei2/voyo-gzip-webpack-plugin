const path = require("path");
const fs = require("fs");
const zlib = require('zlib');
const id = "ztwx-gzip-webpack-plugin";
const ArraySyncForEach = (arr, run, end) => {
    arr.length ?
        run(arr[0], () => ArraySyncForEach(arr.slice(1), run, end))
        : end();
};
class GzipWebpackPlugin {
    constructor(b) {
        b = b || {};
        this.extList = b.extList || [];
        this.outputPath = b.outputPath || "";
        this.rootPath = process.cwd();
    }
    getExt(filename) {
        const regExpArr = /\.(\w+)$/.exec(filename);
        if (!regExpArr)
            return "";
        return regExpArr[1];
    }
    toKb(size) {
        size = Math.round(size / 10.24);
        return size / 100 + "KB";
    }
    printModuleSize(filename, originLength, outputLength) {
        filename = path.relative(this.outputPath, filename);
        filename = "\x1b[33m" + filename + "\x1b[30m";
        console.log(`${filename}:  ${this.toKb(originLength)}==>\x1b[31m${this.toKb(outputLength)}\x1b[30m`);
    }
    gzipFile(filepath, cb) {
        if (!filepath)
            return;
        const ext = this.getExt(filepath);
        if (!ext)
            return;
        if (this.extList && !this.extList.includes(ext))
            return;
        fs.readFile(filepath, (err, buffer) => {
            zlib.gzip(buffer, (err, gzipBuffer) => {
                this.printModuleSize(filepath, buffer.length, gzipBuffer.length);
                fs.writeFile(filepath, gzipBuffer, (err) => {
                    cb && cb(err);
                });
            });
        });
    }
    apply(compiler) {
        let outputPath = (compiler.options.output || {}).path;
        if (this.outputPath)
            outputPath = this.outputPath;
        this.outputPath = outputPath;
        compiler.hooks.assetEmitted.tap(id, (file, content) => {
            const filePath = path.join(outputPath, file);
            if (!fs.existsSync(filePath))
                return;
            this.gzipFile(filePath);
        });
    }
}
exports.GzipWebpackPlugin = GzipWebpackPlugin;
