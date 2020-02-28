import * as express from 'express';
// import * as cors from 'cors';
import * as bodyparser from 'body-parser';
import {requestLoggerMiddleware} from './request.logger.middleware';
import {todoRoutes} from './battles.controller';
const app = express();
//app.use(cors());
app.use(bodyparser.json());

//TODO - add middle ware
app.use(requestLoggerMiddleware);
app.use(todoRoutes);
//EndPoints


export {app};