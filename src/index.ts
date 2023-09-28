// Anexando ao objeto global

import UserController from "./controllers/UserController";

(() => {
    try {
        console.log(`Iniciando aplicação...`);
        new UserController();

        const newUser = UserController.create({
            name: "João",
            password: "123456",
            phone: "123456789"
        });

        console.log(`Usuário criado: ${newUser.name}`);

    } catch (error) {
        console.log(`Erro na aplicação:`);
        console.error(error);
    }
})();