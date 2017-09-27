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