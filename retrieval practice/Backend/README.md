lambda retrieval practice backend
-------------

This is the folder for the backend of the retrieval practice EdX module from he tuDelft's lambda team.

> **this node server requires:**
> - [Express](https://expressjs.com/en/starter/installing.html)
> - [body-parser](https://www.npmjs.com/package/body-parser)
> - [mongoose](http://mongoosejs.com/docs/index.html)

#### <i class="icon-pencil"></i> Setup
**node.js server**

First you will need an node.js server this can be obtained and installed following the instructions on there [website](https://nodejs.org/en/download/).

After the node.js server is installed you'll need to install (and probably save) the required library as listed in the requirements above.

**Configuration the server**

All the server code, including it's configurations is in the server.js file. In this file there are a few settings you may need to change in order to run the server.
To change the server ports you can change the port numbers on lines 9 and 10 in server.js.

*Default server ports:*
```
// ports:
let httpPort = 80;
let httpsPort = 443;
```

If you need to change the request settings this can be done at line 13 and 14 in server.js. 

*Default server request settings:*
```
// header settings
let origin = "*";
let headers = "Origin, X-Requested-With, Accept, X-CSRFToken, chap, seq, vert";
```

In order to use the https option a valid http certificate and key are needed. The path to these key and certificate are specified in server.js on line 58 and 59

*Default server https settings:*
```
let options = {
    key: fs.readFileSync('[path to key file]'),
    cert: fs.readFileSync('[path to certificate file]')
};
```
the server contains a special debug setting that when turend on allows you to upload questions, remove questions and request data from the server. these functions can be turned of by the use of the global <kbd>dev</kbd> variable. this can be found on line 17 in server.js.
  
  *Default server dev mode settings:*
```
//To indicate if you are running an development environment
let dev = true;
```

**running the server**

after everything is configured use the `node server.js` command to run the server. If  this doesn't work check on the node.js documentation if the running method changed.
If everything goes well the following message should appear:
`Node server start on port: [httpPort] for http and port: [httpsPort] for https`
  
If this is the first time running the server you'll need to upload some questions to it in order to get started.

#### <i class="icon-upload"></i> Uploading questions to the server
> **Make sure Dev mode is true!!**

**course export**
To upload the questions to the server you'll first need to export the EdX course.
This can be done by going to the export tab under the tool dropdown list and clicking the big blue button saying "Export Course Content" and if the export is comlpeted by clicking on the "Download Exported Course" button.

**Adding the parser Code**
If you have dowloaded the course you'll have a file called `course.<someId>.tar.gz`.
Exstarct this file. for more infromation on extracting tar.gz files see [this](https://opensource.com/article/17/7/how-unzip-targz-file) page.
In the course folder paste the parser folder so that you end up with somthing like this:
![folder view](http://casparkrijgsman.com/img/RPcourseParserExample0.png)

**config the parser**
to set the serveraddres to upload it to open the file caled `courseImport.js` and on line 74 you will find the following line:
`"url": "<host>:<port>/api/upload",` change the serveradress on this line to your server addres.
for example:
`"url": "http://server.yourwebsite.com:3000/api/upload",`
now the config is ready

**runing the parser**
Inside the parser folder there is a file caled `courseImport.html` you'll need to run this file as a local host instance.
the easyst way to do this is to use the python SimpleHTTPserver. more on how to set this up can be found [here](http://www.pythonforbeginners.com/modules-in-python/how-to-use-simplehttpserver/).

**Uploading**
Now that we got it running it is time to upload!
on the page press the `build and upload` button to pars the questions and upload them.

**selection procces**
click the button `start removal process` to show all the question one by one to remove broken questions.
this version of the selection procces is verry limited there is a new tool under consturtion for this.
it will be included here as soon as it is finished.