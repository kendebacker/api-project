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
    // Check if file present already/ correct extension
    const extenstion = file.originalname.split(".")
    callback(null, mapMemory.get(file.originalname)===undefined && extenstion.length==2 && extenstion[1]==="wav")
}
  
const upload = multer({fileFilter, storage })
let mapMemory = null

app.listen(PORT,  async ()=> {
    // Create map of existing files already present with basic information for querying
    fs.readFile("./Storage/memory.json",  'utf8', (err, data) =>{
        if(err){
            throw err
        }
        mapMemory = data===""?new Map():new Map(Object.entries(JSON.parse(data)));
        console.log("Running...")
    })
})

app.get(`/list`, (req,res)=>{
    // Query map based on duration, return array of names
    const maxDur = req.query.maxduration
    const files = Array.from(mapMemory.values()).filter(file => file.duration <=  maxDur).map(file => file.name)
    const response = files.length ===0?"No files found":`Found ${files.length} files`
    res.status(200).json({body: response, data: files})
})

app.get(`/info`, (req,res)=>{
    // Query map based on key name (file name), return file object
    const fileName  = req.query.name
    const noFile = mapMemory.get(fileName)===undefined
    const response = noFile?`No file info found`:`File info retrieved`
    const fileInfo = noFile?"":mapMemory.get(fileName)
    res.status(noFile?400:200).json({body: response, data: fileInfo})
})

app.get(`/download`, (req,res)=>{
    // See if file present in map, if so download if not throw error.
    const fileName = req.query.name
    if(mapMemory.get(fileName)!==undefined){
        res.status(200).download(`${mapMemory.get(fileName).path}`, fileName)
    }else{
        res.status(400).json({body:`File not found`})
    }
})

app.post("/post", upload.single("file"), (req, res)=>{
    // Check if file present, if so don't store in map, if not store in map
    if(req.file !== undefined){
        getAudioDurationInSeconds(req.file.path).then(dur => {
            const currentDay = new Date().toLocaleDateString()
            const fileName = req.file.originalname
            mapMemory.set(fileName,{name: fileName, duration: dur, added: currentDay, path: req.file.path})
            fs.writeFile("./Storage/memory.json", JSON.stringify(Object.fromEntries(mapMemory)), (err)=>{
                res.status(err?500:200).json({body: err?`Error storing data: ${err}`:"File succesfully stored"})
            })
        }).catch((err) => res.status(500).json({body: `Error getting duration: ${err}`}))
    }else{
        res.status(400).json({body: `File already exists or incorrect extension`})
    }
})
