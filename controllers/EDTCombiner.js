class EDTCombiner{
    
    constructor(master,complementaire){
      this.master = master;
      this.complementaire = complementaire;
    }
    
    concate(){
        return this.master.map(objmaster =>{
            const objetcomplementaire = this.complementaire.find(elem=> elem.uid===objmaster.uid);
            return {
                ...objetcomplementaire,
                ...objmaster,
            }
        });
    }
}
module.exports = EDTCombiner;

