class Vertical {
    constructor(id){
        this.id = id;
        this.problems = [];
    }

    addProblem(problem){
        this.problems.push(problem);
    }

    getProblems(){
        return this.problems;
    }

    getId(){
        return this.id;
    }

    /**
     * builds a vertical and gets its problems dept first.
     * @param xml
     * @param subSection
     */
    static build(xml,subSection){
        let xmlDoc = xml.responseXML;
        let verticalXml = xmlDoc.getElementsByTagName("vertical");

        //for all verticals in a subSection get the vertical and its problems
        for(let i in verticalXml) {
            let ver = verticalXml[i];
            if (ver.attributes != undefined) {
                let vertical = new Vertical(ver.attributes.getNamedItem("url_name").textContent);
                subSection.addVertical(vertical);
                let file = "../vertical/"+ver.attributes.getNamedItem("url_name").textContent+".xml";
                loadXMLDoc(file,Problem.build,vertical);
            }
        }

    }
}
