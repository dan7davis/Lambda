var course = {
    id: 0,
    imgUrl: "https://courses.edx.org/asset-v1:",
    dataBaseProblems: [],
    sections: [],
    counter: 0,
    setId: function (id) {
        this.id = id;
    },
    getSectionById: function (id) {
        for (var i in this.sections){
            if (this.sections[i].getId() == id){
                return this.sections[i];
            }
        }
    },
    getSubSectionsById: function (id) {
        var section;
        for (var i in this.sections){
            section = this.sections[i];
            for (var j in section.getSubSections()){
                if (section.getSubSections()[i].getId() == id){
                    return section.getSubSections()[i];
                }
            }
        }
    },
    buildDataStructure: function () {
        for(let sectionIndex in course.sections){
            let sectionId = course.sections[sectionIndex].getId();
            let sectionLvl = course.sections[sectionIndex].getLvl();
            let subSections = course.sections[sectionIndex].getSubSections();
            for (let subSectionIndex in subSections){
                let subSectionId = subSections[subSectionIndex].getId();
                let verticals = subSections[subSectionIndex].getVerticals();
                for (let verticalIndex in verticals){
                    let verticalId = verticals[verticalIndex].getId();
                    let problems = verticals[verticalIndex].getProblems();
                    for (let problemIndex in problems) {
                        if (problems[problemIndex] != undefined) {
                            course.dataBaseProblems.push(new DataStructure(problems[problemIndex], verticalId, subSectionId, sectionId, sectionLvl, course.id));
                        }
                    }
                }
            }
        }
        $("#build") .removeClass("shown")
                    .addClass("hidden");
        $("#removeseq") .addClass("shown")
                        .removeClass("hidden");
        course.upload();
    },
    upload: function () {

        let length = course.dataBaseProblems.length;
        let i = 0;
        let j = 5;

        while (i < length) {

            j = i + 5;

            if(j > length){
                j = length;
            }

            let currentProblems = course.dataBaseProblems.splice(i,j);

            console.log("lenght: "+ length+", i: "+ i+ ", j: "+j);
            console.log(currentProblems);
            var settings = {
                "async": false,
                crossDomain: true,
                "url": "<host>:<port>/api/upload",
                "method": "POST",
                "data": {
                    "problems": currentProblems
                },
                success: function (response) {
                    console.log(response);
                    $("#content").innerHTML = response;
                }
            };
            $.ajax(settings);

            length = course.dataBaseProblems.length;
        }
    },
    removeseq: function () {
        $("#removeseq") .addClass("hidden")
                        .removeClass("shown");
        $("#remove")    .addClass("shown")
                        .removeClass("hidden");
        $("#next")      .addClass("shown")
                        .removeClass("hidden");

        this.counter = 0;

        $('#text').html(this.dataBaseProblems[this.counter].problem.text);
    },
    remove: function () {

        let id = this.dataBaseProblems[this.counter].problem.id;

        var settings = {
            "async": false,
            crossDomain: true,
            "url": "https://lambda-rp.ewi.tudelft.nl/api/remove",
            "method": "POST",
            "data": {
                "problemId": id
            },
            success: function (response) {
                console.log(response);
                $("#content").innerHTML = response;
            }
        };
        $.ajax(settings);

        this.next();
    },
    next: function () {
        this.counter++;

        $('#text').html(this.dataBaseProblems[this.counter].problem.text);
    }
};

/**
 * the xml file loader
 * @param file
 * @param func
 */
function loadXMLDoc(file,func,par,par2) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            func(this,par,par2);
        }
    };
    xmlhttp.open("GET", file, false);
    xmlhttp.send();
}

/**
 * sets up the course object
 * @param xml
 */
function getCourseId(xml) {
    var xmlDoc = xml.responseXML;
    course.setId(xmlDoc.childNodes[0].attributes.getNamedItem("course").textContent);
    course.imgUrl += xmlDoc.childNodes[0].attributes.getNamedItem("org").textContent + "+" + xmlDoc.childNodes[0].attributes.getNamedItem("course").textContent + "+2T2017+type@asset+block@";

}

/**
 * adds all sections to the course object
 */
function getSections() {
    var file = "../course/course.xml";
    loadXMLDoc(file,Section.build);
}

/**
 * adds all the subsections to all the sections
 */
function getSubSections() {
    for (var i in course.sections){
        var file = "../chapter/" + course.sections[i].getId() +".xml";
        loadXMLDoc(file,SubSection.build,course.sections[i].getId());
    }
}


function checkComp() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        alert("okee!!");
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}

function main() {
    loadXMLDoc("../course.xml",getCourseId);

    getSections();

    getSubSections();
}