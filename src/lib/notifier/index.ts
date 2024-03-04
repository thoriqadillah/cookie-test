import { EmailNotifier } from "./email"
import { AppNotifier } from "./in-app"

export interface NotifierOption {
    authMethod?: string
    host?: string
    service?: string
    username?: string
    password?: string
    port?: number
    sender?: string
    tls?: boolean
    // TODO: more option
}

export interface SendOption {
    from?: string
    templatePath?: string
    subject?: string
    cc?: string[]
    bcc?: string[]
    message?: string
    payload?: any
    // TODO: more option
}

export interface Notifier {
    send(recepients: string[], option?: SendOption): Promise<void>
}

export type NotifierFactory = (option?: NotifierOption) => Notifier
const impls = {
    email: (option?: NotifierOption) => new EmailNotifier(option),
    'in-app': (option?: NotifierOption) => new AppNotifier(option)
}

export type NotifierName = keyof typeof impls
export const notifier = {
    create(name: NotifierName, option?: NotifierOption): Notifier {
        if (!impls[name]) throw new Error(`No implementation of notifier for ${name}`)
        return impls[name](option)
    }
}
