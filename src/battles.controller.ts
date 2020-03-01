import * as express from 'express';
import * as mongodb from 'mongodb';
import { MongoHelper } from './mongo.helper';

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

//Stats Done:
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

            //ATTACKER OUT COME found
            let win_count = 0;
            let loss_count = 0;
            for(let i = 0 ; i < battles.length; i++){
                if(battles[i].attacker_outcome == 'win')
                {
                    win_count++;
                }
                if(battles[i].attacker_outcome == 'loss')
                {
                    loss_count++;
                }
            }
            //DEFFENDER AMOUNT INFORMATION
            let defendermin;
            let defendermax;
            let defenderaverage;
            let sum = 0;
            let defenderValuesArray = [];

            for(let i = 0 ; i < battles.length; i++){
                if(battles[i].defender_size == '')
                {
                    battles[i].defender_size = null;
                }
                defenderValuesArray[i] = battles[i].defender_size;
            }
            var Filttered_defenderValuesArray = defenderValuesArray.filter(function (el) {
                return el != null;
            });

            
            defendermin = Math.min.apply(null, Filttered_defenderValuesArray);
            defendermax = Math.max.apply(null, Filttered_defenderValuesArray);

            for(let i = 0 ; i < Filttered_defenderValuesArray.length; i++){
                sum += Filttered_defenderValuesArray[i];
            }

            defenderaverage = sum/Filttered_defenderValuesArray.length;

            let response = {
                most_active: {
                    attacker_king: most_active_attacker,
                    defender_king: most_active_defender,
                    region: most_active_region
                },
                attacker_outcome:{
                    win: win_count,
                    loss: loss_count
                },
                battle_type:uniquesArray_ofbattle_types,
                defender_size: {
                    average: defenderaverage,
                    min: defendermin,
                    max: defendermax
                }
            }

            resp.json(response);
        }
    })
});

// todoRoutes.get('/search', (req: express.Request, resp: express.Response, next: express.NextFunction) => {
//     const collection = getCollection();
//     const query = Object.keys(req.query).map((key => {
//         const obj = {};
//         obj[key] = req.query[key];
//         return obj;
//     }));


//     resp.json(query);
// });

todoRoutes.get('/search', (req: express.Request, resp: express.Response, next: express.NextFunction) => {
	const collection = getCollection();
	const parameters = req.query;
	const andQuery = Object.keys(parameters).map((key => {
		const obj = {};
		obj[key] = parameters[key];
		return obj;
	}));
	collection.find({$and: andQuery }).toArray((err, battles) => {
		if(err){
            		resp.status(500);
            		resp.end();
            		console.error('Cautch Error', err);
        	} else {
			resp.send(battles);
		}
	});
});

export { todoRoutes };