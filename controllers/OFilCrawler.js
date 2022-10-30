const axios = require("axios");
const jws = require("jws");

class OFilCrawler {
    static USER_LANG = "fr";
    static USER_AGENT = "okhttp/4.3.1";
    static API_URL = "https://api.appscho.com";
    static API_KEY = "83e87b66a73be3c935f564c2bca8be369e28223d";
    static DEVICE_ID = "android-823aa566-841a-4dfe-a537-17f8b9734e16";
    static UNIV_CODE = "ueve";
    

    constructor(){
        this._userToken = null;

        this._crawler = axios.create({
            baseURL: OFilCrawler.API_URL,
            headers: {
                'User-Agent': OFilCrawler.USER_AGENT
            }
        });
    }

    async login(){
        try{
            let response = await this._crawler.get(`${OFilCrawler.UNIV_CODE}/login`, {
                headers: {
                    'x-appscho-id': process.env.USER_ID,
                    'x-appscho-token': process.env.USER_PASSWD,
                    'User-Agent': OFilCrawler.USER_AGENT
                }
            });

            if(response.status == 200 && response.data.state == "ok"){
                this._userToken = response.data.response.token;
            } else {
                throw new Error(`Une erreur est survenue lors de l'authentification, vérifiez vos identifiants. ${e.response.data.message}`);
            }
        } catch (e) {
            //console.log(e);
            throw new Error(`Échec de la connexion à l'API OFil, vérifiez vos identifiants. ${e.response.data.message}`);
        }
    }

    async getGroups(){
        await this.login();
        try{
            let response = await this._crawler.get(`${OFilCrawler.UNIV_CODE}/planning/groups`, {
                headers: {
                    'x-appscho-token': this._userToken,
                    'accept-language': OFilCrawler.USER_LANG,
                    'User-Agent': OFilCrawler.USER_AGENT
                }
            });

            if(response.status == 200 && response.data.state == "ok"){
                return response.data.response;
            }
        } catch (e) {
            //console.log(e);
            throw new Error(`Échec de la récupération des groupes. ${e.response.data.message}`);
        }
    }

    isLoggedIn(){
        if(this._userToken != null){
            const token = jws.decode(this._userToken);
            return ((new Date().getTime() / 1000) > token.payload.exp);
        } else {
            return false;
        }
    }

    async getPlanning(idPlanning){
        await this.login();
        try{
            let response = await this._crawler.get(`${OFilCrawler.UNIV_CODE}/planning`, {
                headers: {
                    'x-appscho-token': this._userToken,
                    'accept-language': OFilCrawler.USER_LANG,
                    'x-appscho-planningid': idPlanning,
                    'User-Agent': OFilCrawler.USER_AGENT
                }
            });

            if(response.status == 200 && response.data.state == "ok"){
                return response.data.response;
            }
        } catch (e) {
            throw new Error(`Échec de la récupération du planning. ${e.response.data.message}`);
        }
    }
}

module.exports = OFilCrawler;