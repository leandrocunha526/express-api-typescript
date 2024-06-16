import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource } from './../core/DataSource/data-source';
import router from './routes';
import dotenv from 'dotenv';
import morgan from "morgan";
import swaggerUi from 'swagger-ui-express';
import swaggerFile from "./swagger_output.json";
import cors from 'cors';

dotenv.config();

AppDataSource.initialize().then(() => {
    const app = express();
    app.use(express.json());

    app.use(morgan("dev"));

    app.use('/api', router);

    app.use(cors())

    app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Server is running on localhost:' + PORT);
    });

    // request 404
    app.use((req, res) => {
        res.status(404).json({ message: 'Error 404: Not found' });
    });

    // error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).json({ message: 'Something went wrong!' });
    });

}).catch(error => console.log(error));
