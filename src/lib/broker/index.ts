import { NotifierName } from "../notifier"
import { EventBroker } from "./event"
import { PubsubBroker } from "./pubsub"
import { SNSBroker } from "./sns"

export interface BrokerOption {
    id?: string 
    subscription?: string
    accessKey?: string
    secretKey?: string
    region?: string
    protocol?: string
}

export enum Priority {
    VERY_HIGH,
    HIGH,
    MEDIUM,
    LOW
}

export interface Payload {
    priority?: Priority
    notifyType?: NotifierName[]
    data?: any
}

export interface Broker {
    publish(topic: string, payload?: Payload): void
    subscribe(topic: string, callback: (payload?: Payload) => void): void
}

export type BrokerFactory = (option?: BrokerOption) => Broker
const impls = {
    event: (option?: BrokerOption) => new EventBroker(option),
    // pubsub: (option?: BrokerOption) => new PubsubBroker(option),
    sns: (option?: BrokerOption) => new SNSBroker(option)
}

export type BrokerName = keyof typeof impls
export const broker = {
    create(name: BrokerName, option?: BrokerOption): Broker {
        if (!impls[name]) throw new Error(`Broker ${name} is not implemented`)
        const factory = impls[name]

        return factory(option)
    }
}