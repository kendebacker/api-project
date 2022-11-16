import './App.css';
import { useState } from 'react';

function App() {

  const [file, setFile] = useState("")
  const [response, setResponse] = useState("")
  const [duration, setDuration] = useState("")
  const [searchName, setSearchName] = useState("")
  const [searchDuration, setSearchDuration] = useState("")
  const [nameQuery, setNameQuery] = useState("")
  const [durationQuery, setDurationQuery] = useState("")
  const [searchDataName, setSearchDataName] = useState("")
  const [searchData, setSearchData] = useState("")

  const audioSize = file===""?"":URL.createObjectURL(file)
  
  const addSong = ()=>{
    const formData = new FormData()
    formData.append("file", file)
    formData.append("duration", duration)
    formData.append("added", Date.now())
    const data = {method: 'POST', body: formData,  }
    fetch('http://localhost:8080/post', data)
    .then(res => res.json())
    .then(res => setResponse(res.response))
  }

  const queryName=()=>{
    fetch(`http://localhost:8080/info?name=${searchName}`)
    .then(res => res.json())
    .then(res => setNameQuery(res))
  }

  const queryDuration=()=>{
    fetch(`http://localhost:8080/list?maxduration=${searchDuration}`)
    .then(res => res.json())
    .then(res => setDurationQuery(res))
  }

  const queryData=()=>{
    fetch(`http://localhost:8080/download?name=${searchDataName}`)
    .then(res => {return res.ok?res.blob():Promise.reject(res)})
    .then(res => {
      setSearchData(`${searchDataName} downloading`)
      const el = document.createElement("a")
      el.href = URL.createObjectURL(res)
      el.download = `${searchDataName}`
      document.body.appendChild(el)
      el.click()
    }).catch((err)=> {setSearchData(`${searchDataName} not found`)})
  }

  return (
    <div className="App">
        <h2>Search for file Info</h2>
        <input  onChange={(e)=>{setSearchName(e.target.value)}} type={"text"} name={"fileName"}></input><br></br>
        <button onClick={()=>{queryName()}}>Search</button><br></br>
        <strong>{nameQuery===""?"":nameQuery.response}</strong><br></br>
        <ul>{nameQuery==="" || nameQuery.data===""?"":Object.keys(nameQuery.data).map((el,ind)=><li key={ind}>{el}: {nameQuery.data[el]}</li>)}</ul>
        <h2>Search duration list</h2>
        <input  onChange={(e)=>{setSearchDuration(e.target.value)}} type={"number"} name={"duration"}></input><br></br>
        <button onClick={()=>{queryDuration()}}>Search</button><br></br>
        <strong>{durationQuery===""?"":durationQuery.response}</strong><br></br>
        {durationQuery===""?"":<ol>{durationQuery.data.map((el,ind)=> <li key={ind}>{el}</li>)}</ol>}
        <h2>Upload File:</h2>
        <input  onChange={(e)=>{setFile(e.target.files[0])}} type={"file"} name={"file"}></input><br></br>
        <button disabled={duration===""?true:false} onClick={()=>{addSong()}}>Submit File</button><br></br>
        <strong>{response===""?"":response}</strong><br></br>
        <audio onLoadedMetadata={(e)=>{setDuration(e.target.duration)}} hidden={false} src={audioSize}></audio>
        <h2>Search for file Data</h2><br></br>
        <input  onChange={(e)=>{setSearchDataName(e.target.value)}}  type={"text"} name={"fileName"}></input><br></br>
        <button onClick={()=>{queryData()}}>Search</button><br></br>
        <strong>{searchData===""?"":searchData}</strong>
    </div>
  );
}

export default App;
