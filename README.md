My api which queries, stores, and retrieves files locally. It also has a React UI to interact with it.

Some notes (at least on my mac):<br/> 
curl -F file=@filename http://localhost:8080/post<br/>  
curl "http://localhost:8080/download?name=filename.wav"<br/>  
curl "http://localhost:8080/list?maxduration=300"<br/>  
curl "http://localhost:8080/info?name=myfile.wav"<br/>  
