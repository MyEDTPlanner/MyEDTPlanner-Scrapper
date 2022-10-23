const crypto = require('crypto');

class Seance {
    constructor(start, end, title, type, description, attendees, locations, groups, done, presential, code){
        this.uid = this.generateUID(start, end);
        this.start = start;
        this.end = end;
        this.title = title;
        this.type = type;
        this.description = description;
        this.attendees = attendees;
        this.locations = locations;
        this.groups = groups;
        this.done = done;
        this.presential = presential;
        this.code = code;
    }
    generateUID(start, end){
        const hash = crypto.createHash('md5');
        return hash.update(`${start}${end}`).digest('hex');
    }
}
module.exports = Seance;