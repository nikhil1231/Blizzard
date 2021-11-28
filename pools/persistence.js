import { existsSync, readFileSync, writeFileSync } from "fs";

const DATA_PATH = './data/metadata.json'
const CACHE_PATH = './data/cache.json'

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
  return JSON.parse(readFileSync(CACHE_PATH))
}

export const writeCache = (cache) => {
  writeFileSync(CACHE_PATH, JSON.stringify(cache))
}

