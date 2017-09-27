class SubSection {
    constructor(id){
        this.id = id;
        this.verticlas = []
    }

    getId(){
        return this.id;
    }

    addVertical(verical){
        this.verticlas.push(verical);
    }

    getVerticals(){
        return this.verticlas;
    }

    /**
     * builds a subSection and gets its verticals dept first.
     * @param xml
     * @param sectionId
     */
    static build(xml,sectionId){
        let xmlDoc = xml.responseXML;
        let subSectionXml = xmlDoc.getElementsByTagName("sequential");
        let section = course.getSectionById(sectionId);

        //for all the subSection-ids get all the subSections and its verticals
        for(let i in subSectionXml){
            let subSection = subSectionXml[i];
            if (subSection.attributes != undefined) {
                let sub = new SubSection(subSection.attributes.getNamedItem("url_name").textContent);
                section.addSubSection(sub);
                let file = "../sequential/"+subSection.attributes.getNamedItem("url_name").textContent+".xml";
                loadXMLDoc(file,Vertical.build,sub);
            }
        }

    }

}
