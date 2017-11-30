/**
 * Created by caspa on 10/23/2017.
 */
function LambdaSetup(type) {
    //Get all data
    LambdaLib.gatherData();

    //only once
    if (!LambdaLib.isSetUp()) {
        //indicate that we run setup.
        LambdaLib.setUp();

        //Set up trackers
        LambdaLib.setServer("https://server.casparkrijgsman.com");
        LambdaLib.trackUser();
        LambdaLib.trackProblems();
        LambdaLib.trackVideo();

        LambdaLib.SP.setQualityRef('https://edge.edx.org/asset-v1:DelftX+DD.003x+2017+type@asset+block@qualityPlanning.html');
        LambdaLib.SP.setQuantityRef('https://edge.edx.org/asset-v1:DelftX+DD.003x+2017+type@asset+block@quantityPlannign.html');
        console.log("setUp complete");
    }

    //Code to run after setup
    switch (type) {
        case 1:
            LambdaLib.SP.getInitialData(true,false,false,false);
            break;
        case 2:
            LambdaLib.SP.getInitialData(true,true,false,false);
            break;
        case 3:
            LambdaLib.SP.getInitialData(false,false,true,false);
            break;
        case 4:
            LambdaLib.SP.getInitialData(false,false,true,true);
            break;
        case 5:
            LambdaLib.SP.getInitialData(true,true,true,true);
            break;
        default:
            LambdaLib.SP.getInitialData(false,false,false,false);
            break;
    }
}

function LambdaSetupCheck(type) {
    if (typeof LambdaLib !== 'undefined' && typeof LambdaSetup !== 'undefined' && typeof analytics !== 'undefined') {
        if (typeof LambdaLib.SP !== 'undefined' && typeof analytics._user !== 'undefined') {
            if (LambdaLib.SP.ready()) {
                LambdaSetup(type);
            } else {
                setTimeout(function () {
                    LambdaSetupCheck(type);
                }, 100);
            }
        }
    }
    else {
        setTimeout(function () {
            LambdaSetupCheck(type);
        }, 100);
    }
}

function loadNeededModules() {
    //Base module
    loadScriptSync("https://server.casparkrijgsman.com/static/librarys/lambda-edx-lib.js");
    //SP-module
    loadScriptSync("https://server.casparkrijgsman.com/static/librarys/progressbar.min.js");
    loadScriptSync("https://server.casparkrijgsman.com/static/librarys/lambda-study-planning.js");
}

function loadScriptSync (src) {
    let s = document.createElement('script');
    s.src = src;
    s.type = "text/javascript";
    s.async = false;                                 // <-- this is important
    document.getElementsByTagName('head')[0].appendChild(s);
}
