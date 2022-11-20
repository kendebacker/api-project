const express = require("express");
const multer = require('multer');
const cors = require('cors')
const fs = require('fs')
const PORT = 8080
const app = express()
const { getAudioDurationInSeconds } = require('get-audio-duration')
app.use(cors())

let mapMemory = null

app.listen(PORT,  async ()=> {
    // Create map of existing files already present with basic information for querying
    fs.readFile("./storage/memory.json",  'utf8', (err, data) =>{
        if(err){
            console.log(err)
        }
        mapMemory = data===""?new Map():new Map(Object.entries(JSON.parse(data)));
        console.log("Running...")
    })
})

const storage = multer.diskStorage({
    // Save file to Storage folder
    filename: (req, file, callback)=>{
        callback(null, file.originalname)
    },
    destination: (req, file, callback)=>{
        callback(null, "./storage")
    }
})

const fileFilter =(req, file, callback) =>{
    // Check if file present already/ correct extension
    const extenstion = file.originalname.split(".")
    callback(null, mapMemory.get(file.originalname)===undefined && extenstion.length==2 && extenstion[1]==="wav")
}
  
const upload = multer({fileFilter: fileFilter, storage: storage, limits: {fileSize: 3000000}}).single("file")

app.post("/post", (req, res)=>{
    // check if file meets standards/is already present
    upload(req, res, (err)=>{
        if(err || req.file === undefined){
            res.status(400).json({body: `File already exists, is to large, or is improperly formated`})
        }else{
            getAudioDurationInSeconds(req.file.path).then(dur => {
                const currentDay = new Date().toLocaleDateString()
                const fileName = req.file.originalname
                mapMemory.set(fileName, {name: fileName, duration: dur, dateAdded: currentDay, path: req.file.path})
                fs.writeFile("./storage/memory.json", JSON.stringify(Object.fromEntries(mapMemory)), (err)=>{
                    res.status(err?500:200).json({body: err ?`Error storing data: ${err}`:`${fileName} succesfully stored`})
                })
            }).catch((err) => res.status(500).json({body: `Error getting duration: ${err}`}))
        }
    })
})

app.get(`/list`, (req,res)=>{
    // Query map based on duration, return array of names
    const maxDur = req.query.maxduration
    if(!isNaN(maxDur) && !isNaN(parseFloat(maxDur))){
        const files = Array.from(mapMemory.values()).filter(file => file.duration <=  parseFloat(maxDur)).map(file => file.name)
        const response = files.length ===0?"No files found":`Found ${files.length} files`
        res.status(200).json({body: response, data: files})
    }else{
        res.status(400).json({body: "Query is not properly formatted", data: []})
    }

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
        res.status(400).json({body: "File not found"})
    }
})

