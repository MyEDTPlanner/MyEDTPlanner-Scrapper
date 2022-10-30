const Seance = require('../models/seance');
const Enseignant = require('../models/enseignant');

class ICSEventParser {
    static REGEX_SALLE = / (?=RFC|IBGBI|PEL|AX|BX|CX|1CY|IDF|MAU|IUT)/;
    static REGEX_DESCRIPTION = /(?<key>[^:]+(?= : )) : (?<value>.+)/;

    constructor(event){
        this._event = event;
        this._descInfos = {};
        this.start;
        this.end;
        this.title;
        this.type;
        this.description;
        this.attendees = [];
        this.locations;
        this.groups = [];
        this.done;
        this.presential;
        this.code;
    }
    parse(){
        this.extractDescriptionInfos();
        this.extractStartDate();
        this.extractEndDate();
        this.extractDescription();
        this.extractAttendees();
        this.extractGroups();
        this.extractIsDone();
        this.extractIsPresential();
        this.extractLocations();
        this.extractTitle();
        this.extractType();
        this.extractCode();

        return new Seance(
            this.start,
            this.end,
            this.title,
            this.type,
            this.description,
            this.attendees,
            this.locations,
            this.groups,
            this.done,
            this.presential,
            this.code
        );
    }
    extractType(){
        let type = this._event.summary.split(" - ")[1];
        if(type){
            type = type.trim();
            switch (type) {
                case "CM":
                    this.type = "Cours";
                    break;
                case "TD":
                    this.type = "TP";
                    break;
                default:
                    this.type = type;
            }
        } else {
            this.type = "Autre";
        }
    }
    extractTitle(){
        this.title = this._event.summary.split(" - ")[0].trim();
    }
    extractLocations(){
        this.locations = this._event.location.split(ICSEventParser.REGEX_SALLE);
    }
    extractStartDate(){
        this.start = this._event.start;
    }
    extractEndDate(){
        this.end = this._event.end;
    }
    extractDescription(){  
        this.description = Object.entries(this._descInfos).reduce((acc, [key, value]) => {
            if(!["PROF", "MATIERE", "DUREE"].includes(key)){
                acc.push(`${key} : ${value}`);
            }
            return acc;
        }, []).join("\n");
    }
    extractAttendees(){
        let list = this._descInfos["PROF"] ? this._descInfos["PROF"].split(" / ") : [];
        this.attendees = list.map((name) => new Enseignant('', name));
    }
    extractGroups(){

    }
    extractIsDone(){
        
    }
    extractCode(){
        
    }
    extractIsPresential(){
        this.presential = this._descInfos["COMMENTAIRE"] ? !this._descInfos["COMMENTAIRE"].includes('Distanciel') : true;
    }
    extractDescriptionInfos(){
        let desc = this._event.description.val.split("\n");
        this._descInfos = desc.reduce((acc, line) => {
            let match = line.match(ICSEventParser.REGEX_DESCRIPTION);
            if(match){
                acc[match.groups.key.trim()] = match.groups.value.trim();
            }
            return acc;
        }, {});
    }
}
module.exports = ICSEventParser;