import { BrokerOption, Broker } from ".";
import aws from '@aws-sdk/client-sns'
import { env } from "../env";

export class SNSBroker implements Broker {

    private sns
    private option: BrokerOption
    constructor(option?: BrokerOption) {
        this.option = {
            accessKey: env.get('BROKER_ACCESS_KEY').toString(),
            secretKey: env.get('BROKER_SECRET_KEY').toString(),
            region: env.get("BROKER_REGION").toString(),
            protocol: env.get("BROKER_PROTOCOL").toString(),
            ...option
        }

        this.sns = new aws.SNS({ 
            region: this.option.region
            // TODO: more option
        })
    }

    async publish(topic: string, payload?: any): Promise<void> {
        // TODO: test if used
        await this.sns.publish({
            TopicArn: topic,
            Message: JSON.stringify(payload),
        })
    }

    async subscribe(topic: string, callback: (payload?: any) => void): Promise<void> {
        const data = await this.sns.subscribe({
            Protocol: this.option.protocol,
            TopicArn: topic,
        })

        // TODO: 

    }
}