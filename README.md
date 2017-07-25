# File Stream <i>feathersjs</i>

### Cloning the application
----------------------------
```
git@github.com:ShilpiBundela/file-stream.git
```

### Running the application
----------------------------
##### Installing the application
```
with npm :
--------
npm isntall

with yarn :
---------
yarn install
```

##### Running feathers js server

```
without reloading :
-----------------
npm start

with reloading : (dev-server: uses nodemon)
--------------
npm run start:dev

```

##### Accessing the api

```
http://<URL_PATH>:3030/ /* (default) URL_PATH : localhost */
```


### Swagger Doc
---------------
#### [Swagger Api Documentation](https://github.com/ShilpiBundela/file-stream/blob/master/swagger.yaml)



### API's
---------
##### <i>GET</i> : /api/stats/files/:filename
* gets the resource information for the filename

##### <i>GET</i> : /api/get/file/:filehash/:filename
* gets the actual resource from the server
* supports sending large sets of data over streams in chunks with ```Range``` request headers


### CURL commands
-----------------
* curl commands are supplemented with jq for better json parsing


```
curl http://<URL_PATH>:3030/api/stats/files/<unique_file_identifier> | jq '.'

---------------
this should get the details of the file and the hash for the next command
```

```
curl http://<URL_PATH>:3030/api/get/file/<file_hash>/<file_name> --header "Range: bytes=0-"
```
