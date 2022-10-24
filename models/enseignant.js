const crypto = require('crypto');

class Enseignant {
    constructor(firstname, lastname){
        this.firstname = firstname;
        this.lastname = lastname;
    }
}
module.exports = Enseignant;