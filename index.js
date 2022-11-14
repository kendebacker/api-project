const express = require("express");
const multer = require('multer');
const cors = require('cors')
const PORT = 8080
const upload = multer()
const app = express()
app.use(cors())

const memoryStorage = new Map()

app.listen(
    PORT, ()=> console.log('Running...')
)

app.get(`/list`, (req,res)=>{

    const maxDur = req.query.maxduration
    let songs = Array.from(memoryStorage.values())
    console.log(songs)
    songs = songs.filter(song => parseInt(song.duration) <=  maxDur).map(song => song.data.originalname)
    
    const response = songs.length ===0?
    "Sorry, no files found":`Found ${songs.length} files that match requirments`

    res.json({response: response, data: songs})

})

app.get(`/info`, (req,res)=>{

    const response = memoryStorage.get(req.query.name)===undefined?
    `Could not find file with name ${req.query.name}`:`The info for file ${req.query.name}`

    const fileInfo = memoryStorage.get(req.query.name)===undefined?"":memoryStorage.get(req.query.name)
    const data = fileInfo===""?"":{...fileInfo.data, duration: fileInfo.duration, added: fileInfo.added}
    delete data.buffer
    
    res.json({response: response, data: data})

})

app.get(`/download`, (req,res)=>{

    const response = memoryStorage.get(req.query.name)===undefined?
    `Could not find file with name ${req.query.name}`:`The data for file ${req.query.name}`

    const data = memoryStorage.get(req.query.name)===undefined?"":memoryStorage.get(req.query.name).data

    res.json({response: response, data: data})
})

app.post("/post", upload.single("file"), (req, res)=>{
    const fileName = req.file.originalname

    const response = memoryStorage.get(fileName)===undefined?
    `${fileName} recieved and stored`:`${fileName} already exists, please select a unique name`

    memoryStorage.set(fileName,memoryStorage.get(fileName)===undefined?
    {duration: req.body.duration, added:req.body.added, data: req.file}:memoryStorage.get(fileName))

    res.json({response: response})
    
})