declare global{
    namespace NodeJS{
        interface ProcessEnv{
            MONGO_USER: string;
            MONGO_PASS: string;
            JWT_SECRET: string;
            MAIL_ID: string;
            MAIL_PASS: string;
        }
    }
}

export{};