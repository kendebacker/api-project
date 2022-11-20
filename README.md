My api which queries, stores, and retrieves files locally. It also has a React UI to interact with it.

Some notes (at least on my mac):
curl -F file=@filename http://localhost:8080/post 
curl "http://localhost:8080/download?name=filename.wav"
curl "http://localhost:8080/list?maxduration=300"
curl "http://localhost:8080/info?name=myfile.wav"