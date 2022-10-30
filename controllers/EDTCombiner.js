class EDTCombiner{
    
    constructor(master, complementaire){
        this.master = master;
        this.complementaire = complementaire;
    }
    
    concate(){
        return this.master.map(objmaster => {
            const objetcomplementaire = this.complementaire.find(elem => elem.uid === objmaster.uid);
            console.log("master: ", objmaster);
            console.log("complementaire: ", objetcomplementaire);
            const result = {...objmaster, ...objetcomplementaire};
            console.log("result: ", result);
            return result;
        });
    }
}
module.exports = EDTCombiner;

