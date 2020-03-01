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
            let attackers_array = [];
            let deffender_array = [];
            let most_active_attacker_king;
            let most_active_deffecder_king;

            let uniquesArray_ofAttacker = [];
            let count = 0;
            let found_attacker = false;
            let found_deffender = false;
            let found_region = false;

            for (let i = 0; i<battles.length;i++){

                for(let y = 0; y < uniquesArray_ofAttacker.length;y++){
                    if(battles[i].attacker_king == uniquesArray_ofAttacker[y]){
                        found_attacker = true;
                    }
                }
                count++;
                if(count == 1 && found_attacker == false){
                    uniquesArray_ofAttacker.push(battles[i].attacker_king)
                }
                count = 0;
                found_attacker = false;     
            }
            
            let most_appeared_values = 0; 
            let counter=0;
            let most_active_attacker;
            let most_active_deffender;
            let most_active_region;

            for(let i = 0; i<uniquesArray_ofAttacker.length;i++){
                for(let y = 0; y<battles.length;y++){
                    if(uniquesArray_ofAttacker[i] == battles[y].attacker_king){
                        counter++;
                    }                      
                }
                //console.log(counter);
                if(most_appeared_values < counter){
                    most_appeared_values = counter;
                    most_active_attacker = uniquesArray_ofAttacker[i];
                }
                counter = 0;

            }
            
            console.log(most_active_attacker);
            resp.json(null);
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