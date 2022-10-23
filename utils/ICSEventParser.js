const Seance = require('../models/seance');

class ICSEventParser {
    constructor(event){
        this._event = event;
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
                default:
                    this.type = type;
            }
        }
    }
    extractTitle(){
        this.title = this._event.summary.split(" - ")[0].trim();
    }
    extractLocations(){
        this.locations = this._event.location;
    }
    extractStartDate(){
        this.start = this._event.start;
    }
    extractEndDate(){
        this.end = this._event.end;
    }
    extractDescription(){    
        this.description = this._event.description.val;
    }
    extractAttendees(){
        let desc = this._event.description.val.split("\n");
        this.attendees = desc.filter(line => line.startsWith("PROF :")).map(line => line.replace("PROF : ", "").trim());
    }
    extractGroups(){

    }
    extractIsDone(){
        
    }
    extractCode(){
        
    }
    extractIsPresential(){
        let desc = this._event.description.val.split("\n");
        this.presential = desc.filter(line => line.startsWith("COMMENTAIRE :")).some(ligne => ligne.includes('Presentiel'));
    }
}
module.exports = ICSEventParser;