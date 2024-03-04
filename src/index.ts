import express from "express";
import dotenv from "dotenv";
import { Visuwisu } from "@/app";
import { parseFlags } from "./lib/flags";

const flags = parseFlags(process.argv)
dotenv.config({ path: flags.env });

const app = express();
const vw = new Visuwisu(app, {
    useDb: false,
    useMemstore: false,
})

vw.start()
vw.shutdown()