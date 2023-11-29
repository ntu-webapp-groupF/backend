import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

import { createClient } from 'redis';
export const redisClient = await createClient(6379).connect();