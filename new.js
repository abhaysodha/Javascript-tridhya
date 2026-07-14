const fs = require ("fs/promise");
const stream = require("stream");

(async() => {
const FileHandle = await fs.open("new.txt" ,"w");

const stream = FileHandle.createWriteStream();
console.log(stream.writeableHighWaterMark);

let i = 0;

const numWriting = 1000000;

const writeMany = () => {
    while(i<numWriting){
        const buff = Buffer.from(`${i} `,"utf-8");

        if(i === numWriting -1){
            return stream.end(buff);
        }
        if(!stream.write(buff)) break;

        i++;
    }
}
    writeMany();

    stream.on("drain" ,() => {
        writeMany();
    })
    stream.on("finish" ,() => {
        console.timeEnd("new.js");
        FileHandle.close();
    })


})();
