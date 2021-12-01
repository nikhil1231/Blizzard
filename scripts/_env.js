import { existsSync, readFileSync, writeFileSync } from "fs"
import { parse, stringify } from 'envfile'
import * as dotenv from 'dotenv'

dotenv.config()

const ENV_PATH = './.env'

export const addToEnv = (key, val) => {
  const envRaw = existsSync(ENV_PATH) ? readFileSync(ENV_PATH).toString() : ""
  const env = parse(envRaw)

  env[key] = val

  writeFileSync(ENV_PATH, stringify(env))
}

export const keyExists = (key) => {
  if (!existsSync(ENV_PATH)) return false

  const envRaw = readFileSync(ENV_PATH).toString()
  const env = parse(envRaw)

  return key in env
}

export const getEntry = (key) => {
  return process.env[key]
}