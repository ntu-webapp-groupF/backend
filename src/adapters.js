import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

import { createClient } from 'redis';

let client;
(async () => {
    client = createClient();

    client.on("error", (error) => console.error(`Error : ${error}`));

    await client.connect();
})();

export default client;
