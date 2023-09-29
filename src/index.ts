import express from "express";

import UserController from "./controllers/UserController";


(() => {
    try {
        console.log(`Iniciando aplicação...`);

        const app = express();
        const router = express.Router();

        new UserController(router);

        app.use(express.json());
        app.use('/users', router);

        app.listen(3000, () => {
            console.log(`Aplicação iniciada na porta 3000`);
        });
    } catch (error) {
        console.log(`Erro na aplicação:`);
        console.error(error);
    }
})();