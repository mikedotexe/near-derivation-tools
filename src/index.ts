import dotenv from 'dotenv';

dotenv.config({
    debug: true,
    encoding: 'UTF8'
});

const informativeError = 'hey dev, set your env vars'
export const NEAR_SEED_PHRASE = process.env.NEAR_SEED_PHRASE || informativeError
export const INFURA_API_KEY = process.env.INFURA_API_KEY || informativeError
export const NEAR_NETWORK = process.env.NEAR_NETWORK || informativeError

// let's export all the goodies!
export * from './getter';
