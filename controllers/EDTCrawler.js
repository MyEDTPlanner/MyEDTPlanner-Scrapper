const Seance = require('../models/seance');
const EDTCombiner = require('./EDTCombiner');
const ICSEventParser = require('../utils/ICSEventParser');
const WebEventParser = require('../utils/WebEventParser');
const axios = require("axios");
const cheerio = require("cheerio");
const ical = require('node-ical');
const url = require('url');
const axioswrapper = require("axios-cookiejar-support");
const tough = require("tough-cookie");
const fs = require('fs');

class EDTCrawler {
    static BASE_URL = "https://edt.univ-evry.fr";

    constructor(code){
        const now = Date.now();
        this._code = code;
        this._icsUrl = null;
        this._idGroupe = null; 
        this._modulesList = [];
        this._coursesList = [];
        this._icsEvents = [];
        this._currentYear = 2022;
        this._currentWeek = now.weekNumber;
        this._cookieJar = new tough.CookieJar();
        this._crawler = axioswrapper.wrapper(axios.create({
            baseURL: EDTCrawler.BASE_URL,
            jar: this._cookieJar
        }));
        //Faire connexion synchrone du login pour attendre la fin de l'initialisation.
    }

    init(){
        this.login().then(() => {
            this.retrieveICS();
            this.retrieveModules().then(
                () => {
                    // Créer la liste des promesses à executer.
                    let promiseStack = this._modulesList.map(module => this.retrieveModule(module));

                    //Executer les promesses.
                    Promise.all(promiseStack).then(() => {
                        //Faire le traitement des données.
                        fs.writeFileSync('storage/web.json', JSON.stringify(this._coursesList));
                        fs.writeFileSync('storage/ics.json', JSON.stringify(this._icsEvents));
                        fs.writeFileSync('storage/final.json', JSON.stringify(new EDTCombiner(this._coursesList, this._icsEvents).concate()));
                    });
                }
            );
        });
    }
    async login(){
        const params = new url.URLSearchParams({
            loginstudent: this._code,
            logintype: 'student'
        });

        let response = await this._crawler.post('/index.php', params.toString());
        //console.log(response.data);
        if(this.checkResponse(response.data)){
            const $ = cheerio.load(response.data);
            this._icsUrl = $('#menu li ul li a[href$=".ics"]')?.attr('href');
            this._idGroupe = $('input[name="current_student"]')?.attr('value');
            console.log("La connexion a réussie.");
            console.log(this._icsUrl);
            console.log(this._idGroupe);
        } else {
            throw new Error("La connexion a échouée. Vérifiez le code du groupe.");
        }
    }

    /**
     * Récupère le fichier ICS de planning du groupe.
     */
    async retrieveICS(){
        if(this._icsUrl){
            console.log("Récupération du fichier ICS...");
            let response = await ical.async.fromURL(this._icsUrl);
            //this._icsEvents = Object.values(response).filter(event => event.type == "VEVENT"); // A regarder
            
            for (const event of Object.values(response)) {
                if(event.type === 'VEVENT'){
                    this._icsEvents.push(new ICSEventParser(event).parse());
                }
            }
            console.log("Fichier ICS récupéré.");
        }
    }

    async retrieveModules(){
        if(this._idGroupe){
            console.log("Récupération des modules...");
            let response = await this._crawler.get(`/module_etudiant.php?current_week=${this._currentWeek}&current_year=${this._currentYear}&current_student=${this._idGroupe}`);
            if(this.checkResponse(response.data)){
                const $ = cheerio.load(response.data);
                this._modulesList = Array.from($('select[name="selec_module"] option')).map(({attribs}) => {
                    return attribs.value;
                });
                //console.log(this._modulesList);
                console.log("Liste des modules récupérés.");
            } else {
                throw new Error("La connexion a échoué. Vérifiez le code du groupe.");
            }
        } else {
            throw new Error("Un idGroupe est nécéssaire à la récupération des modules.");
        }
    }

    async retrieveModule(module){
        console.log(`Récupération des cours du module ${module}...`);
        let response = await this._crawler.get(`/module_etudiant.php?annee_scolaire=1&selec_module=${module}&jour=0&current_week=${this._currentWeek}&current_year=${this._currentYear}&current_student=${this._idGroupe}`);
        if(this.checkResponse(response.data)){
            const $ = cheerio.load(response.data);
            // Récupérer la liste des séances du module.
            let donnees = [];
            let entetes = [];
            const tableau = $('body > div:nth-child(5) > table tr');
            tableau.each((index, element) => {  
                if(index === 0){
                    let rangee = $(element).find("th");
                    $(rangee).each((i, element) => {
                        let titre = $(element).text().trim().toLowerCase().replace(/[\s\uFEFF\xA0]*[>][ ]*/, '');
                        entetes.push(titre);
                    });
                } else {
                    let rangee = $(element).find("td");
                    const ligne = {};
                    $(rangee).each((i, element) => {
                        ligne[entetes[i]] = $(element).text();
                    });
                    donnees = donnees.concat(new WebEventParser(ligne, module).parse());
                }
            });
            console.log(`Cours du module ${module} récupérés.`);

            this._coursesList = this._coursesList.concat(donnees);
        } else {
            throw new Error("La connexion a échoué. Vérifiez le code du groupe.");
        }
    }

    /**
     * Vérifie si la tentative de connexion a réussie.
     * Vérifie si le contenu reçu du serveur ne contient pas le champ de la page de connexion.
     * @param {string} response Le contenu de la page reçu du serveur.
     * @returns {boolean} true si la connexion a réussie.
     */
    checkResponse(response){
        const $ = cheerio.load(response);
        return $('form > input[name="loginstudent"]').length == 0 && !response.includes("Vous avez été déconnecté.");
    }
}
module.exports = EDTCrawler;