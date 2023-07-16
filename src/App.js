import "./App.css";
import { useState } from "react";

function App() {
  const [file, setFile] = useState("");
  const [response, setResponse] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDuration, setSearchDuration] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [durationQuery, setDurationQuery] = useState("");
  const [searchDataName, setSearchDataName] = useState("");
  const [searchData, setSearchData] = useState("");

  const uploadAudio = () => {
    const formData = new FormData();
    formData.append("file", file);
    const data = { method: "POST", body: formData };
    fetch("http://localhost:8080/post", data)
      .then((res) => res.json())
      .then((res) => setResponse(res))
      .catch((err) => alert(err));
  };

  const queryName = () => {
    fetch(`http://localhost:8080/info?name=${searchName}`)
      .then((res) => res.json())
      .then((res) => setNameQuery(res))
      .catch((err) => alert(err));
  };

  const queryDuration = () => {
    fetch(`http://localhost:8080/list?maxduration=${searchDuration}`)
      .then((res) => res.json())
      .then((res) => setDurationQuery(res))
      .catch((err) => alert(err));
  };

  const queryData = () => {
    fetch(`http://localhost:8080/download?name=${searchDataName}`)
      .then((res) => {
        if (res.ok) {
          return res.blob();
        } else {
          throw new Error("File not found");
        }
      })
      .then((res) => {
        setSearchData(`${searchDataName} downloading`);
        const el = document.createElement("a");
        el.href = URL.createObjectURL(res);
        el.download = `${searchDataName}`;
        document.body.appendChild(el);
        el.click();
      })
      .catch((err) => alert(err));
  };

  return (
    <div className="App">
      <h2>Search file Info</h2>
      <input
        onChange={(e) => {
          setSearchName(e.target.value);
        }}
        type={"text"}
        name={"fileName"}
      ></input>
      <br />
      <button
        onClick={() => {
          queryName();
        }}
      >
        Search
      </button>
      <br />
      <strong>{nameQuery === "" ? "" : nameQuery.body}</strong>
      <ul>
        {nameQuery === "" || nameQuery.data === ""
          ? ""
          : Object.keys(nameQuery.data).map((el, ind) => (
              <li key={ind}>
                {el}: {nameQuery.data[el]}
              </li>
            ))}
      </ul>
      <h2>Search Max Duration</h2>
      <input
        onChange={(e) => {
          setSearchDuration(e.target.value);
        }}
        type={"number"}
        name={"duration"}
      ></input>
      <br />
      <button
        onClick={() => {
          queryDuration();
        }}
      >
        Search
      </button>
      <br />
      <strong>{durationQuery === "" ? "" : durationQuery.body}</strong>
      {durationQuery === "" ? (
        ""
      ) : (
        <ol>
          {durationQuery.data.map((el, ind) => (
            <li key={ind}>{el}</li>
          ))}
        </ol>
      )}
      <h2>Upload File:</h2>
      <input
        onChange={(e) => {
          setFile(e.target.files[0]);
        }}
        type={"file"}
        name={"file"}
      ></input>
      <br />
      <button
        disabled={file === "" ? true : false}
        onClick={() => {
          uploadAudio();
        }}
      >
        Submit File
      </button>
      <br />
      <strong>{response === "" ? "" : response.body}</strong>
      <h2>Search for file Data</h2>
      <input
        onChange={(e) => {
          setSearchDataName(e.target.value);
        }}
        type={"text"}
        name={"fileName"}
      ></input>
      <br />
      <button
        onClick={() => {
          queryData();
        }}
      >
        Search
      </button>
      <br />
      <strong>{searchData === "" ? "" : searchData}</strong>
    </div>
  );
}

export default App;
