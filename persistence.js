import { existsSync, readFileSync, writeFileSync } from "fs";
import { Cache } from './cache.js';

const DATA_PATH = './data/metadata.json'
const CACHE_PATH = './data/cache.json'
const BLACKLIST_PATH = './blacklist.txt'

export const metadataExists = () => {
  return existsSync(DATA_PATH)
}

export const readMetadata = () => {
  return JSON.parse(readFileSync(DATA_PATH))
}

export const writeMetadata = (metadata) => {
  writeFileSync(DATA_PATH, JSON.stringify(metadata))
}

export const readCache = () => {
  return Object.assign(new Cache, JSON.parse(readFileSync(CACHE_PATH)))
}

export const writeCache = (cache) => {
  writeFileSync(CACHE_PATH, JSON.stringify(cache))
}

export const readBlacklist = () => {
  return readFileSync(BLACKLIST_PATH).toString()
    .replace(/\r/g, '')
    .split('\n')
}
