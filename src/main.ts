import {app} from './app';
import * as http from 'http';
import { MongoHelper } from './mongo.helper';

const PORT = 8080;
const server = http.createServer(app);


server.listen(PORT);

server.on('listening', async () => {
    console.info(`Listening on port ${PORT}`);

    try{
        await MongoHelper.connect('mongodb+srv://AdminDarjus:root@cluster0-auwcn.mongodb.net/test?retryWrites=true&w=majority');
        console.info('Connected To Mongo')
    }catch(err){
        console.error(err);
    }
});

