$(document).ready(function () {
    let state = 0;

    let courseId;
    let server;
    let courseTime;

    //States
    let step1 = $("#step1");
    let step2 = $("#step2");
    let step3 = $("#step3");
    let done =  $("#done");

    //Buttons
    let state0Next = $("#state0Next");
    let state1Next = $("#state1Next");
    let state2Next = $("#state2Next");

    let state1Previous = $("#state1Previous");
    let state2Previous = $("#state2Previous");
    let restart = $("#restart");

    let openStep2 = $("#openStep2");
    let openStep3 = $("#openStep3");

    function next() {
        switch(state) {
            case 0:
                step1.toggle();
                step2.toggle();
                state = 1;
                Step1();
                break;
            case 1:
                step2.toggle();
                step3.toggle();
                Step2();
                state = 2;
                break;
            case 2:
                step3.toggle();
                done.toggle();
                state = 3;
                Step3();
                break;
        }
    }

    function previous() {

        switch (state) {
            case 1:
                step1.toggle();
                step2.toggle();
                state = 0;
                break;
            case 2:
                step2.toggle();
                step3.toggle();
                state = 1;
                break;
            case 3:
                step1.toggle();
                done.toggle();
                state = 0;
                break;

        }
    }

    function Step1() {
        server = $("#server").val();
        courseId = $("#courseId").val();
        courseTime = $("#time").val();
    }

    function Step2() {
        let vidmap = $("#videoScraping").val();
        document.getElementById("vidMap").innerHTML = "var vidMap = " + vidmap + ";";

    }

    function Step3() {
        let data = $("#scraping").val();
        data = JSON.parse(data);

        let courseId = data[0];

        let map = data.slice(1);

        map = map.filter(function (element) {
            return element[0] != null;
        });


        if (typeof server !== 'undefined' && server !== "") {
            let settings = {
                "async": true,
                "crossDomain": true,
                "url": server + "/study-planning/courseLayoutUpload",
                "method": "POST",
                "data": {
                    "courseId": courseId,
                    "map": map,
                    "time" : courseTime,
                }
            };

            $.ajax(settings)
        }

    }

    function openStep2Page() {
        let url = "https://insights.edx.org/courses/course-v1:"+courseId+"/engagement/videos/";
        window.open(url, '_blank');
    }

    function openStep3Page() {
        let url = "https://courses.edx.org/courses/course-v1:"+courseId+"/progress";
        window.open(url, '_blank');

    }




    /* BUTTON SETUP*/
    state0Next.on("click", next);
    state1Next.on("click", next);
    state2Next.on("click", next);

    state1Previous.on("click", previous);
    state2Previous.on("click", previous);
    restart.on("click",previous);

    openStep2.on("click",openStep2Page);
    openStep3.on("click",openStep3Page);

    console.log("setup completed");
});