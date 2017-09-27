class Problem {
    constructor(id,name,type,answer,text,options,choices,tolerance){
        this.id = id;
        this.name = name;
        this.type = type;
        this.answer = answer;
        this.text = text;
        this.options = options;
        this.choices = choices;
        this.tolerance = tolerance;
    }

    getId(){
        return this.id;
    }

    /**
     * gets an problem and builds it.
     * @param xml
     * @param vertical
     */
    static build(xml,vertical) {
        let xmlDoc = xml.responseXML;
        let problemXml = xmlDoc.getElementsByTagName("problem");

        //for all the problems in a vertical get the problem and its content
        for (let i in problemXml) {
            let prob = problemXml[i];
            if (prob.attributes != undefined) {
                let file = "../problem/" + prob.attributes.getNamedItem("url_name").textContent + ".xml";
                loadXMLDoc(file, Problem.populate, vertical,prob.attributes.getNamedItem("url_name").textContent);
            }
        }


    }

    /**
     * determent's the type of the question that is askt
     * @param xml
     * @returns String if the type is found else it returns null
     */
    static getAType(xml) {
        //test to see what type it is:
        if(xml.getElementsByTagName("multiplechoiceresponse").length > 0){
            return "multiplechoiceresponse";
        }else if(xml.getElementsByTagName("optionresponse").length > 0){
            return "optionresponse";
        }else if(xml.getElementsByTagName("numericalresponse").length > 0){
            return "numericalresponse";
        }else if(xml.getElementsByTagName("choiceresponse").length > 0){
            return "choiceresponse";
        }else return null;


    }

    /**
     * gets the content of a question an parses it to object form
     * @param xml
     * @param vertical
     * @param problemId
     */
    static populate(xml,vertical,problemId) {
        let xmlDoc = xml.responseXML;

        //Get the problem part
        let problemXml = xmlDoc.getElementsByTagName("problem")[0];
        let name = problemXml.attributes.getNamedItem("display_name").textContent;

        //determent the type of problem
        let type = Problem.getAType(problemXml);

        //if there is a problem pars it
        if (type != null) {
            //init vars
            let options = [];
            let choices = [];
            let answer = undefined;
            let tolerance = 0;
            let text = "";
            //the multiple-choice parsing
            if (type == "multiplechoiceresponse" || type == "choiceresponse") {
                //Getting all choices
                let choicesXml = problemXml.getElementsByTagName("choice");
                for (let i in choicesXml) {
                    if (choicesXml[i].innerHTML != undefined) {
                        choices.push(choicesXml[i].innerHTML);
                        if (choicesXml[i].attributes != undefined) {
                            if (choicesXml[i].attributes.getNamedItem("correct").textContent.toUpperCase() == "TRUE") {
                                if(answer != undefined) {
                                    return;
                                }
                                answer = i;
                            }
                        }
                    }
                }
                //If it is only a choice question:
                if (problemXml.childNodes[1] == problemXml.getElementsByTagName("multiplechoiceresponse")[0]){
                    console.log("found a question only question");
                    text = problemXml.childNodes[1];
                    //remove the buttons
                    let x = text.getElementsByTagName("choicegroup")[0];
                    //console.log(x);
                    if(x != undefined) {
                        x.parentNode.removeChild(x);
                    }
                    //remove te solution
                    let Y = text.getElementsByTagName("solution")[0];
                    //console.log(Y);
                    if(Y != undefined) {
                        Y.parentNode.removeChild(Y);
                    }
                    text = text.innerHTML;
                    if(problemId == "9ef68a4135df48f994290afb74c829b7")
                    console.log(text);
                }else if (problemXml.childNodes[1] == problemXml.getElementsByTagName("choiceresponse")[0]){
                    console.log("found a question only question");
                    text = problemXml.childNodes[1];
                    //remove the buttons
                    let x = text.getElementsByTagName("checkboxgroup")[0];
                    if(x != undefined) {
                        x.parentNode.removeChild(x);
                    }
                    //remove te solution
                    let Y = text.getElementsByTagName("solution")[0];
                    if(Y != undefined) {
                        Y.parentNode.removeChild(Y);
                    }
                    text = text.innerHTML;
                }else {
                    text = problemXml;
                    let x = text.getElementsByTagName(type)[0];
                    x.parentNode.removeChild(x);
                    let Y = text.getElementsByTagName("solution")[0];
                    if(Y != undefined) {
                        Y.parentNode.removeChild(Y);
                    }
                    text = text.innerHTML;
                }
                /*
                //The option parsing
            } else if (type == "optionresponse") {
                let optionXml = problemXml.getElementsByTagName("option");
                for (let i in optionXml) {
                    if (optionXml[i].innerHTML != undefined) {
                        options.push(optionXml[i].innerHTML);
                        if (optionXml[i].attributes != undefined) {
                            if (optionXml[i].attributes.getNamedItem("correct").textContent.toUpperCase() == "TRUE") {
                                answer = i;
                            }
                        }
                    }
                }   //The numerical parsing
                let x = text.getElementsByTagName(type)[0];
                x.parentNode.removeChild(x);
                text = text.innerHTML; */
            } else if (type == "numericalresponse") {
                if (problemXml.getElementsByTagName("responseparam")[0] != undefined) {
                    tolerance = problemXml.getElementsByTagName("responseparam")[0].attributes.getNamedItem("default").textContent;
                }
                if (problemXml.getElementsByTagName("numericalresponse")[0] != undefined) {
                    answer = problemXml.getElementsByTagName("numericalresponse")[0].attributes.getNamedItem("answer").textContent;
                }

                if (problemXml.childNodes[1] == problemXml.getElementsByTagName("numericalresponse")[0]) {
                    text = problemXml.childNodes[1];
                    let x = text.getElementsByTagName("formulaequationinput")[0];
                    if(x != undefined) {
                        x.parentNode.removeChild(x);
                    }
                    //remove te solution
                    let Y = text.getElementsByTagName("solution")[0];
                    if(Y != undefined) {
                        Y.parentNode.removeChild(Y);
                    }
                    //remove te responseparam
                    let Z = text.getElementsByTagName("responseparam")[0];
                    if(Z != undefined) {
                        Z.parentNode.removeChild(Z);
                    }
                    text = text.innerHTML;
                }else {
                    text = problemXml;
                    let x = text.getElementsByTagName(type)[0];
                    x.parentNode.removeChild(x);
                    let Y = text.getElementsByTagName("solution")[0];
                    if(Y != undefined) {
                        Y.parentNode.removeChild(Y);
                    }
                    text = text.innerHTML;
                }
            }

            //------------------------------------------------------------OLD
            //getting the question text by removing the question out of it
            //let x = text.getElementsByTagName(type)[0];
            //x.parentNode.removeChild(x);
            //text = text.innerHTML;
            //-----------------------------------------------------------------

            //add it to the vertical
            text = text.replace(/\/static\//g,course.imgUrl);
            text = text.replace(/<img/g,"<br><img");
            text = text.replace(/\/>/g,"/><br>");
            vertical.addProblem(new Problem(problemId, name, type, answer, text, options, choices, tolerance))
        }
    }
}