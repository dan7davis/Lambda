lambda study planning
=====================
this is the folder for the study planning v1 EdX module from he tuDelft's lambda team.



lambda study planning backend
-----------------------------
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
This server runs on only on https and this port can be configured on line 60.
*Default server port:*
```
// port:
var port     = process.env.PORT || 8080; // Use the enviorment port or use 8080 if enviorment is not set
```

If you need to change the request settings this can be done at line 63 and 64 in server.js.

*Default server request settings:*
```
// header settings
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Accept, X-CSRFToken, chap, seq, vert");
```

In order to use the https option a valid http certificate and key are needed. The path to these key and certificate are specified in server.js on line 12 and 13

*Default server https settings:*
```
var options = {
    key: fs.readFileSync('[path to key file]'),
    cert: fs.readFileSync('[path to certificate file]')
};
```

To set the database name for the mongoDB you can change this url on line 26 to you database nam:

  *Default server database settings:*
```
// Build the connection string
var dbURL = 'localhost:27017/SP';
// <Host>:<Port>/<custom-Database-name>
```

**running the server**

after everything is configured use the `node server.js` command to run the server. If this doesn't work check on the node.js documentation if the running method changed.
If everything goes well the following message should appear:
`Node server start on port: [Port]`

If you need to mange multiple servers I  recomend that you take a look at [pm2](http://pm2.keymetrics.io/)

Now that the server is running it is time to implement some modules in the course.

lambda study planning FrontEnd
-------------
#### config ####

The most important setting is the server address. This needs to be set in every file separately.
The variables can be found on he following lines: `quality: 275`, `quantity: 172`, `sensor: 18`
```
var SERVER_URL = "<host>:<port>";
```

**Quality.html**

There is not much to change here. all that there is to do here is to set the dev variable.
If this is true there will be console logs.

```
//Runtime data
var dev = false;
```

**Quantity.html**

Here there is a little more to do. We need to set the weekly hour last of the course on line 171.


```
var TIME_PER_WEEK = 6;
```

**Sensor.html**

If you set the server url than your all set here.

---

#### static imports ####

upload all the files in the static folder to the course at `content->Files&Uploads`

#### To Gather Course Design Information ####

 1. Go to `https://insights.edx.org/courses/course-v1:[insert course id here]/engagement/videos/`
 2. In the JavaScript console, run the **video_scrape.js** file
 3. Open the **scraping.js** file
 4. Paste the current content of your clipboard into the `vidMap` variable and save the file
 5. Go to `https://courses.edx.org/courses/course-v1:[insert course id here]/progress`
 6. In the JavaScript console, run the **scraping.js** file
 7. Open the **mapped.js** file
 8. Paste the current content of your clipboard into the `mapped` variable and save the file
 9. In edX Studio click **Content > Files & Uploads**
 10. Click the green " + Upload New File" button
 11. Select and upload **mapped.js**

#### Quality ####

The quality module is meant to let users set there quality goal and view it later on.
This means that it has two modes:
- Set mode
- view mode

to select the start view of the module set one of the following two style classes to `display: block` and the other to `display: none`.

```
    [lines 125 - 131]

    #replace { // This is the Set mode
        display: block;
    }

    #startPlan { // This is the View mode
        display: none;
    }
```


#### Quantity ####

The Quantity module helps user to plan amounts of work and time to spent and shows there progress.
This means that this has two modes as well:
- Set mode
- view mode

to select the start view of the module just like the quality set one of the following two style classes to `display: block` and the other to `display: none`.

```
    [lines 144 - 150]

    #replace { // This is the Set mode
        display: block;
    }

    #startPlan { // This is the View mode
        display: none;
    }
```


#### Sensor ####

The sensor code is to keep track of the users progress and is therfor needed on every page that doesn't have the quantity or quality module on it.