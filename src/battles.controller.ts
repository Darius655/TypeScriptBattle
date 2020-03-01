import * as express from 'express';
import * as mongodb from 'mongodb';
import { MongoHelper } from './mongo.helper';
import { callbackify } from 'util';


const todoRoutes = express.Router();

const getCollection = () => {
    return MongoHelper.client.db('battles').collection('battles');
}

//GET REQUESTS
todoRoutes.get('/list', (req: express.Request, resp: express.Response, next: express.NextFunction) =>{
    const collection = getCollection();
    collection.find({}).toArray((err, items) => {
        
        if(err){
            resp.status(500);
            resp.end();
            console.error('Cautch Error', err);
        }else{
            //items = items.map((item) => {return {name: item.name, location: item.location}});
            let names_location_array = [];


            for (var i in items) {

                if(items[i].location == '')
                {
                    items[i].location = 'place of the battle is unknown';
                }

                names_location_array[i] = 'The Battle ' + items[i].name + ' was taken in ' + items[i].location;



                // console.log('The Battle: ' + items[i].name + ' was taken in ' + items[i].location);
               
            }
            // console.log(items[2].name);
            resp.json(names_location_array);
        }
    })
});

//Count Done:
todoRoutes.get('/count', (req: express.Request, resp: express.Response, next: express.NextFunction) =>{
    const collection = getCollection();

    collection.find({}).toArray((err, battlesCount) => {
        if(err){
            resp.status(500);
            resp.end();
            console.error('Cautch Error', err);
        }else{
            //battlesCount = battlesCount.map((battlesCount) => {return { id: battlesCount._id, name: battlesCount.name}});
            resp.json(battlesCount.length);
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
            let most_active = battles.map((battle) => {
                return {attacker_king: battle.attacker_king
                        /*defender_king: battle.defender_king, */
                        /*region: battle.region,*/}});

            let attacker_outcome = battles.map((battle) => {
                return {id: battle._id, 
                        win: battle.win, 
                        loss: battle.loss}});

            let battle_type = battles.map((battle) => {
                return {id: battle._id, 
                        battle_type: battle.battle_type}});

            let defender_size = battles.map((battle) => {
                return {id: battle._id,
                defender_size: battle.defender_size}});
                
            // console.log(Object.values(most_active));
        

            
            console.log(Object.values(most_active));
              
             
            
            // resp.json(most_active);
            // resp.json(attacker_outcome);
            // resp.json(battle_type);
            // resp.json(defender_size);
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