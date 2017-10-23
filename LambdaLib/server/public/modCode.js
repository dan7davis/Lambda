/**
 * Created by caspa on 10/23/2017.
 */
function LambdaSetup() {
    //Get all data
    LambdaLib.gatherData();

    //only once
    if (!LambdaLib.isSetUp()) {
        //indicate that we run setup.
        LambdaLib.setUp();

        //Set up trackers
        LambdaLib.setServer("https://server.casparkrijgsman.com");
        LambdaLib.trackUser(false);
        LambdaLib.trackProblems(false);
        console.log("setUp complete");
    }
}
