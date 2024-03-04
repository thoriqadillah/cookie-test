import type { Express } from "express";
import express from "express";
import bodyParser from 'body-parser'
import { ExpressService, services } from "@/app/module";
import { env } from "@/lib/env";
import cors from 'cors'
import { IncomingMessage, Server, ServerResponse } from "http";
import morgan from "morgan";
import { Connection, Database } from "@/db";
import { User } from "@/app/module/account/account.model";
import { Memstore } from "@/db/memstore";
import fs from 'fs'
import https from 'https'

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export interface Service {
    createRoutes(): void
}

export interface ServiceInitter {
    init(): void
}

function canInit(service: any): service is ServiceInitter {
    return 'init' in service
}

export interface ServiceCloser {
    close(): void
}

function canClose(service: any): service is ServiceCloser {
    return 'close' in service
}

export interface App {
    start(): void
    shutdown(): void
}

export interface AppOption {
    name?: string
    useDb?: boolean
    useMemstore?: boolean
    services?: ExpressService[]
}

export class Visuwisu implements App {

    private BASE_URL = env.get('BASE_URL').toString('http://localhost')
    private PORT = env.get('PORT').toNumber(3000)
    private server: Server<typeof IncomingMessage, typeof ServerResponse> | undefined = undefined
    private option: AppOption
    private db: Connection = new Database()
    private memstore: Connection = new Memstore()
    private services: Service[] = []
    private environment = env.get('NODE_ENV').toString('dev')

    constructor(private app: Express, option?: AppOption) {
        this.option = {
            services,
            name: 'index',
            useDb: true,
            useMemstore: true,
            ...option
        }

        // default middleware
        app.use(
            express.json(),
            bodyParser.urlencoded({ extended: true }),
            morgan(':method \t :url \t :status \t :response-time ms'),
            cors({ 
                origin: env.get('CORS_ALLOWED_ORIGIN').toString('*'),
                credentials: true,
                allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
            }),
        )
    }

    start() {
        if (this.option.useDb) this.db.open()
        if (this.option.useMemstore) this.memstore.open()

        for (const service of this.option.services!) {
            const svc = service(this.app)

            if (canInit(svc)) svc.init()
            svc.createRoutes()

            this.services.push(svc)
        }

        const options = {
            key: fs.readFileSync('./localhost.key'),
            cert: fs.readFileSync('./localhost.crt')
          };

        this.server = https.createServer(options, this.app).listen(this.PORT, () => {
            console.log(`Server ${this.option.name} is running at ${this.BASE_URL}:${this.PORT}`)

            if (this.environment === 'dev') {
                console.log(
                    'Registered routes:',
                    this.app._router.stack
                        .map((el: any) => el.handle.stack)
                        .filter((el: any) => el !== undefined)
                        .flatMap((el: any) => el)
                        .map((el: any) => Object.keys(el.route.methods)[0].toUpperCase() + ' ' + el.route.path)
                );
            }
        })
    }

    private _shutdown() {
        console.log('\nHTTP server closed...')
        if (this.server) this.server.close()

        if (this.option.useDb) this.db.close()
        if (this.option.useMemstore) this.memstore.close()
    }

    shutdown() {
        for (const service of this.services) {
            if (canClose(service)) service.close()
        }

        if (this.environment === 'test') this._shutdown()

        // graceful shutdown
        const signals = ['SIGTERM', 'SIGINT', 'SIGQUIT']
        for (const signal of signals) {
            process.on(signal, () => this._shutdown())
        }
    }
}