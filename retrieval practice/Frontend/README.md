lambda retrieval practice FrontEnd
-------------
This is the folder for the FrontEnd of the retrieval practice EdX module from he tuDelft's lambda team.

**config**
This applys for both `yesPopup.html` and `noPopup.html`.
find the line : `var server = "<host>:<port>";` (yesPopup at line 197 and noPopup line 4)
and replace this with your own server information for example:
`var server = "http://server.yourwebsite.com:1234";`
*Note: EdX requers that you use Https from there website*

**static imports**
upload all the files in the static folder to the course at `content->Files&Uploads`

**Yes-popup**
The yes popup code is used in pages where you want the users to recive a retreval-pratice popup.
to place it in a page add a new HTML component and select `Raw HTML` now paste all the code from the yes-popup file in this component and you are good to go.

**No-popup**
the No popup code is for traking your users through out the course. this sensor is needed on as manny pages, that do not contain yes-popup, as posible.
