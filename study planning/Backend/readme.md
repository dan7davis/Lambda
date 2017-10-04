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