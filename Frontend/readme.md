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