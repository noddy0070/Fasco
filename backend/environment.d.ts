declare global{
    namespace NodeJS{
        interface ProcessEnv{
            MONGO_USER: string;
            MONGO_PASS: string;
        }
    }
}

export{};