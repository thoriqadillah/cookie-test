import { BrokerOption, Broker } from ".";
import { env } from "../env";
import { PubSub } from '@google-cloud/pubsub'


export class PubsubBroker implements Broker {

    private option: BrokerOption
    private pubsub: PubSub
    constructor(option?: BrokerOption) {
        this.option = {
            id: env.get('PUBSUB_PROJECT_ID').toString(),
            subscription: env.get('PUBSUB_SUBSCRIPTION_ID').toString(),
            ...option
        }

        this.pubsub = new PubSub({ projectId: this.option.id })
    }

    async publish(topic: string, payload?: any): Promise<void> {
        // TODO: test if used
        const buffer = Buffer.from(JSON.stringify(payload))
        await this.pubsub.topic(topic).publishMessage({ data: buffer })
    }

    subscribe(topic: string, callback: (payload?: any) => void): void {
        // TODO: test if used
        const subscriber = this.pubsub.subscription(topic)
        subscriber.on('message', message => {
            const data = JSON.parse(message.data.toString())
            callback(data)

            message.ack()
        })
    }
}