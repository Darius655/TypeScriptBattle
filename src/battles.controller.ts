import * as express from 'express';
import * as mongodb from 'mongodb';
import { MongoHelper } from './mongo.helper';
import { callbackify } from 'util';


const todoRoutes = express.Router();

const getCollection = () => {
    return MongoHelper.client.db('battles').collection('battles');
}

//GET REQUESTS

//List Done:
todoRoutes.get('/list', (req: express.Request, resp: express.Response, next: express.NextFunction) =>{
    const collection = getCollection();
    collection.find({}).toArray((err, battles) => {
        
        if(err){
            resp.status(500);
            resp.end();
            console.error('Cautch Error', err);
        }else{
            //items = items.map((item) => {return {name: item.name, location: item.location}});
            let names_location_array = [];

            for (var i in battles) {

                if(battles[i].location == '')
                {
                    battles[i].location = 'place of the battle is unknown';
                }
                names_location_array[i] = 'The Battle ' + battles[i].name + ' was taken in ' + battles[i].location;               
            }

            resp.json(names_location_array);
        }
    })
});

//Count Done:
todoRoutes.get('/count', (req: express.Request, resp: express.Response, next: express.NextFunction) =>{
    const collection = getCollection();
    collection.find({}).toArray((err, battles) => {
        if(err){
            resp.status(500);
            resp.end();
            console.error('Cautch Error', err);
        }else{            
            resp.json(battles.length);
        }
    })
});


todoRoutes.get('/stats', (req: express.Request, resp: express.Response, next: express.NextFunction) =>{
    const collection = getCollection();
    collection.find({}).toArray((err, battles) => {
        if(err){
            resp.status(500);
            resp.end();
            console.error('Cautch Error', err);
        }else{
            // PREPERATE UNIQ VALUES
            let uniquesArray_ofAttacker = [];
            let uniquesArray_ofdefender = [];
            let uniquesArray_ofregion = [];
            let uniquesArray_ofbattle_types = [];
            let countatk = 0;
            let countdef = 0;
            let countreg = 0;
            let countBtype = 0;
            let found_attacker = false;
            let found_deffender = false;
            let found_region = false;
            let found_battle_type = false;

            for (let i = 0; i<battles.length;i++){

                for(let y = 0; y < uniquesArray_ofAttacker.length;y++){
                    if(battles[i].attacker_king == uniquesArray_ofAttacker[y]){
                        found_attacker = true;
                    }
                }
                for(let y = 0; y < uniquesArray_ofdefender.length;y++){
                    if(battles[i].attacker_king == uniquesArray_ofdefender[y]){
                        found_deffender = true;
                    }
                }
                for(let y = 0; y < uniquesArray_ofregion.length;y++){
                    if(battles[i].attacker_king == uniquesArray_ofregion[y]){
                        found_region = true;
                    }
                }
                for(let y = 0; y < uniquesArray_ofbattle_types.length;y++){
                    if(battles[i].battle_type == ''){
                        battles[i].battle_type = 'unknown_Battle_type';
                    }
                    if(battles[i].battle_type == uniquesArray_ofbattle_types[y]){
                        found_battle_type = true;
                    }
                }
                countatk++;
                countdef++;
                countreg++;
                countBtype++;
                if(countatk == 1 && found_attacker == false){
                    uniquesArray_ofAttacker.push(battles[i].attacker_king)
                }
                if(countdef == 1 && found_deffender == false){
                    uniquesArray_ofdefender.push(battles[i].defender_king)
                }
                if(countreg == 1 && found_region == false){
                    uniquesArray_ofregion.push(battles[i].region)
                }
                if(countBtype == 1 && found_battle_type == false){
                    uniquesArray_ofbattle_types.push(battles[i].battle_type)
                }
                countatk = 0;
                countdef = 0;
                countreg = 0;
                countBtype = 0;
                found_attacker = false;
                found_deffender = false;
                found_region = false;  
                found_battle_type = false;
            }
            console.log(uniquesArray_ofAttacker);
            console.log(uniquesArray_ofdefender);
            console.log(uniquesArray_ofregion);
            console.log(uniquesArray_ofbattle_types);
            //FIND MOST ACTIVE VALUES FROM ARRAYS
            let most_appeared_attack_values = 0;
            let most_appeared_def_values = 0;
            let most_appeared_reg_values = 0;
            let counter_atk=0;
            let counter_def=0;
            let counter_reg=0;
            let most_active_attacker;
            let most_active_defender;
            let most_active_region;
            //Most active attacker
            for(let i = 0; i<uniquesArray_ofAttacker.length;i++){
                for(let y = 0; y<battles.length;y++){
                    if(uniquesArray_ofAttacker[i] == battles[y].attacker_king){
                        counter_atk++;
                    }                      
                }
                if(most_appeared_attack_values < counter_atk){
                    most_appeared_attack_values = counter_atk;
                    most_active_attacker = uniquesArray_ofAttacker[i];
                }
                counter_atk = 0;
            }
            //Most active deffender
            for(let i = 0; i<uniquesArray_ofdefender.length;i++){
                for(let y = 0; y<battles.length;y++){
                    if(uniquesArray_ofdefender[i] == battles[y].defender_king){
                        counter_def++;
                    }                      
                }
                if(most_appeared_def_values < counter_def){
                    most_appeared_def_values = counter_def;
                    most_active_defender = uniquesArray_ofdefender[i];
                }
                counter_def = 0;
            }
            //Most active reggion
            for(let i = 0; i<uniquesArray_ofregion.length;i++){
                for(let y = 0; y<battles.length;y++){
                    if(uniquesArray_ofregion[i] == battles[y].region){
                        counter_reg++;
                    }                      
                }
                if(most_appeared_reg_values < counter_reg){
                    most_appeared_reg_values = counter_reg;
                    most_active_region = uniquesArray_ofregion[i];
                }
                counter_reg = 0;
            }

            // console.log(most_active_attacker);
            // console.log(most_active_defender);
            // console.log(most_active_region);




            let response = {
                most_active: {
                    attacker_king: most_active_attacker,
                    defender_king: most_active_defender,
                    region: most_active_region
                },
                attacker_outcome:{
                    win: "xxx",
                    loss: "xxx"
                },
                battle_type:uniquesArray_ofbattle_types,
                defender_size: {
                    average: "xxx",
                    min: "xxx",
                    max: "xxx"
                }
            }

            resp.json(response);
        }
    })
});


todoRoutes.post('/todo', (req: express.Request, resp: express.Response, next: express.NextFunction) =>{
    const description = req.body['description'];
    const collection = getCollection();
    collection.insert({description: description});
    resp.end();
});

todoRoutes.put('/todo/:id', (req: express.Request, resp: express.Response, next: express.NextFunction) =>{
    console.info(req.body);
    console.info(req.params.id);
    const description = req.body['description'];
    const id = req.params['id'];
    const collection = getCollection();

    collection.findOneAndUpdate({"_id": new mongodb.ObjectId(id)},{$set: {description: description}});

    resp.end();
});

todoRoutes.delete('/todo/:id', (req: express.Request, resp: express.Response, next: express.NextFunction) =>{
    const id = req.params['id'];
    const collection = getCollection();

    collection.remove({"_id": new mongodb.ObjectId(id)});
    resp.end();
});

export { todoRoutes };