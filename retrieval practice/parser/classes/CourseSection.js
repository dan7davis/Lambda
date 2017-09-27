class Section {
    constructor(id,lvl){
        this.id = id;
        this.lvl = lvl;
        this.subSections = [];
    }

    addSubSection(subSection){
        this.subSections.push(subSection);
    }

    getLvl(){
        return this.lvl;
    }

    getId(){
        return this.id;
    }

    getSubSections() {
        return this.subSections;
    }

    static build(xml){
        let xmlDoc = xml.responseXML;
        let sectionListXml = xmlDoc.getElementsByTagName('chapter');

        //get all the sections and add them to course
        for(let i in sectionListXml){
            let section = sectionListXml[i];
            if (section.attributes != undefined) {
                course.sections.push(new Section(section.attributes.getNamedItem("url_name").textContent,i));
            }
        }
    }
}

