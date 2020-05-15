import {Compiler} from "webpack";
import * as webpack from "webpack";
import Compilation = webpack.compilation.Compilation;
const path=require("path");
const fs=require("fs");
const zlib = require('zlib');

const id="ztwx-gzip-webpack-plugin";
const ArraySyncForEach=<T>(
  arr: Array<T>,
  run: (item: T,next: () => void) => void,
  end: () => void
)=>{
  arr.length?
    run(arr[0],()=>ArraySyncForEach(arr.slice(1),run,end))
    :end();
};

export interface GzipWebpackOpts{
  extList?: string[];
  outputPath?: string;
}

class GzipWebpackPlugin{
  extList: string[];
  outputPath: string;
  rootPath: string;
  getExt(filename: string): string{
    const regExpArr: RegExpExecArray|null=/\.(\w+)$/.exec(filename);
    if(!regExpArr)return "";
    return regExpArr[1];
  }
  constructor(b: GzipWebpackOpts) {
    b=b||{};
    this.extList=b.extList||[];
    this.outputPath=b.outputPath||"";
    this.rootPath=process.cwd();
  }
  toKb(size: number): string{
    size=Math.round(size/10.24);
    return size/100+"KB";
  }

  printModuleSize(filename: string,originLength: number,outputLength: number){
    filename=path.relative(this.outputPath,filename);
    filename="\x1b[33m"+filename+"\x1b[30m";
    console.log(`${filename}:  ${this.toKb(originLength)}==>\x1b[31m${this.toKb(outputLength)}\x1b[30m`)
  }

  gzipFile(filepath: string,cb?: (err: any) => void){
    if(!filepath)return;
    const ext=this.getExt(filepath);
    if(!ext)return;
    if(this.extList&&!this.extList.includes(ext))return;

    fs.readFile(filepath,(err: any,buffer: Buffer)=>{
      zlib.gzip(buffer,(err: any,gzipBuffer: Buffer)=>{
            this.printModuleSize(filepath,buffer.length,gzipBuffer.length);
            fs.writeFile(filepath,gzipBuffer,(err: any)=>{
              cb&&cb(err);
            })
      })
    })

  }
  apply(compiler: Compiler){
    let outputPath: any=(compiler.options.output||{}).path;
    if(this.outputPath)outputPath=this.outputPath;
    this.outputPath=outputPath;
    (compiler.hooks as any).assetEmitted.tap(
      id,
      (file: string,content: Buffer)=>{
        const filePath=path.join(outputPath,file);
        if(!fs.existsSync(filePath))return;
        this.gzipFile(filePath);
      }
    )

  }
}

exports.GzipWebpackPlugin=GzipWebpackPlugin;
