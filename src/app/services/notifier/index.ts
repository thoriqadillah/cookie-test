import { Service, ServiceInitter } from "@/app";
import express, { Express, Request, Response } from "express";
import { BrokerName, Payload, broker } from "@/lib/broker";
import { User } from "@/app/module/account/account.model";
import { notifier } from "@/lib/notifier";
import { ExpressService } from "@/app/module";
import { env } from "@/lib/env";

export class NotifierService implements Service {

    private BROKER_DRIVER = env.get('BROKER_DRIVER').toString('event') as BrokerName

    private broker = broker.create(this.BROKER_DRIVER)
    private notifier = notifier.create('email')
    
    constructor(private app: Express) {}

    filterPriority() {
        // TODO:
    }

    sendVerify = (payload?: Payload) => {
        this.filterPriority()
        // this.notifier.send([payload!.data.email], {
        //     // subject: 
        //     // templatePath: 
        //     payload: payload?.data
        // })
    }

    sendForgotPassword = (payload?: Payload) => {
        this.filterPriority()
        // this.notifier.send([payload!.data.email], {
        //     // subject: 
        //     // templatePath: 
        //     payload: payload?.data.token
        // })
    }
    
    createRoutes(): void {
        this.broker.subscribe('user:verify', this.sendVerify)
        this.broker.subscribe('user:forgot-password', this.sendForgotPassword)
    }
}

export const service: ExpressService[] = [
    app => new NotifierService(app)
]