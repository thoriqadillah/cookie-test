import type { Express } from "express";
import { Service } from "@/app";
import { ExampleService } from "@/app/module/example/example.api";
import { AccountService } from "./account/account.api";
import { SettingService } from "./setting/setting.api";
import { env } from "@/lib/env";
import { NotifierService } from "../services/notifier";

export type ExpressService = (app: Express) => Service
export const services: ExpressService[] = [
    app => new ExampleService(app),
    app => new AccountService(app),
    app => new SettingService(app),
]

const environment = env.get('NODE_ENV').toString('dev')
if (environment === 'dev') {
    services.push(app => new NotifierService(app))
}
