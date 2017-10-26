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
        console.log("setUp complete");
    }

    //Code to run after setup
    if (type === 1){
        LambdaLib.SP.getInitialData(true,true,false,false);
    } else {
        LambdaLib.SP.getInitialData(true,false,false,false);
    }

}
