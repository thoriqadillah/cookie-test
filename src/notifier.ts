import express from "express";
import dotenv from "dotenv";
import { Visuwisu } from "@/app";
import { parseFlags } from "./lib/flags";
import { service as notifier } from "./app/services/notifier";

const flags = parseFlags(process.argv)
dotenv.config({ path: flags.env });

const app = express();
const vw = new Visuwisu(app, { 
    services: notifier, 
    name: 'notifier',
    useDb: false,
    useMemstore: false,
})

vw.start()
vw.shutdown()