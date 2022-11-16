const express = require("express");
const multer = require('multer');
const cors = require('cors')
const fs = require('fs')
const PORT = 8080
const app = express()
const { getAudioDurationInSeconds } = require('get-audio-duration')
app.use(cors())


const memoryStorage = new Map()
let memory = ``


app.listen(PORT,  ()=> {
        memory =  fs.readFileSync("./Storage/memory.txt",  'utf-8')
        const midway = memory.replace(/ /g,"").split("$:$").map(el => el.split("$?"))
        midway.forEach((el,ind)=> memoryStorage.set(el[0], {name: el[0], duration: parseInt(el[2]), added: el[1], path: `./Storage/${el[0]}`}))
        console.log('Running...')}
)



const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        if(memoryStorage.get(file.originalname)===undefined){
            callback(null, file.originalname)
        }else{
            callback(null, "discard.wav")
        }
    },
    destination: function (req, file, callback) {
            callback(null, './Storage')
    }
})
  
const upload = multer({ storage })

app.get(`/list`, (req,res)=>{

    const maxDur = req.query.maxduration
    let songs = Array.from(memoryStorage.values())
    console.log(songs)
    songs = songs.filter(song => song.duration <=  maxDur).map(song => song.name)

    console.log(songs)
    console.log(maxDur)
    const response = songs.length ===0?
    "Sorry, no files found":`Found ${songs.length} files that match requirments`

    res.json({response: response, data: songs})

})

app.get(`/info`, (req,res)=>{

    const response = memoryStorage.get(req.query.name)===undefined?
    `Could not find file with name ${req.query.name}`:`The info for file ${req.query.name}`

    const fileInfo = memoryStorage.get(req.query.name)===undefined?
    "":memoryStorage.get(req.query.name)

    res.json({response: response, data: fileInfo})

})

app.get(`/download`, (req,res)=>{
    if(memoryStorage.get(req.query.name)!==undefined){
        res.download(`Storage/${req.query.name}`, req.query.name)
    }else{
        res.status(404).send(`${req.query.name} not found`)
    }
})

app.post("/post", upload.single("file"), (req, res)=>{
        const fileName = req.file.originalname

        const response = memoryStorage.get(fileName)===undefined?
        `${fileName} recieved and stored`:`${fileName} already exists, please select a unique name`

        getAudioDurationInSeconds(req.file.path).then(dur => {
        const newPeice = memoryStorage.get(fileName)===undefined?
        `${fileName}$?${Date.now()}$?${dur}`:""

        memoryStorage.set(fileName,memoryStorage.get(fileName)===undefined?
        {name: fileName, duration: dur, added: Date.now(), path: req.file.path}:memoryStorage.get(fileName))
        memory = `${memory}${newPeice}$:$`
        fs.writeFileSync("./Storage/memory.txt", memory)
        res.json({response: response})
        })
})

