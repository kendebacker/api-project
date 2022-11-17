const express = require("express");
const multer = require('multer');
const cors = require('cors')
const fs = require('fs')
const PORT = 8080
const app = express()
const { getAudioDurationInSeconds } = require('get-audio-duration')
app.use(cors())

const storage = multer.diskStorage({
    // Save file to Storage folder
    filename: (req, file, callback)=>{
        callback(null, file.originalname)
    },
    destination: (req, file, callback)=>{
        callback(null, "./Storage")
    }
})

const fileFilter =(req, file, callback) =>{
    // Check if file present already, if so don't import
    callback(null, mapMemory.get(file.originalname)===undefined)
}
  
const upload = multer({fileFilter, storage })
const mapMemory = new Map()
let writeMemory = ``

app.listen(PORT,  ()=> {
    // Create map of existing files already present with basic information for querying
    writeMemory =  fs.readFileSync("./Storage/memory.txt",  'utf-8')
    const midway = writeMemory.split("$:$").map(el => el.split("$?"))
    midway.forEach((el,ind)=> mapMemory.set(el[0], 
        {name: el[0], duration: parseInt(el[2]), added: el[1], path: `./Storage/${el[0]}`}))
    mapMemory.delete("")
    console.log('Running...')
})

app.get(`/list`, (req,res)=>{
    // Query map based on duration, return array of names
    const maxDur = req.query.maxduration
    let files = Array.from(mapMemory.values())
    files = files.filter(file => file.duration <=  maxDur).map(file => file.name)
    const response = files.length ===0?"No files found":`Found ${files.length} files`
    res.json({response: response, data: files})
})

app.get(`/info`, (req,res)=>{
    // Query map based on key name (file name), return file object
    const fileName = req.query.name
    const response = mapMemory.get(fileName)===undefined?`No info for ${fileName}`:`Info for ${fileName}`
    const fileInfo = mapMemory.get(fileName)===undefined?"":mapMemory.get(fileName)
    res.json({response: response, data: fileInfo})
})

app.get(`/download`, (req,res)=>{
    // See if file present in map, if so download if not throw error.
    const fileName = req.query.name
    if(mapMemory.get(fileName)!==undefined){
        res.download(`Storage/${fileName}`, fileName)
    }else{
        res.status(404).send(`${fileName} not found`)
    }
})

app.post("/post", upload.single("file"), (req, res)=>{
    // Check if file present, if so don't store in map, if not store in map
    if(req.file !== undefined){
        getAudioDurationInSeconds(req.file.path).then(dur => {
            const currentDay = new Date().toLocaleDateString()
            const fileName = req.file.originalname
            const newPeice = `${fileName}$?${currentDay}$?${dur}`
            mapMemory.set(fileName,{name: fileName, duration: dur, added: currentDay, path: req.file.path})
            writeMemory = `${writeMemory}${newPeice}$:$`
            fs.writeFileSync("./Storage/memory.txt", writeMemory)
        })
    }
    res.json({response: req.file === undefined?"File already exists":"File stored"})
})
