import { Notifier, NotifierOption, SendOption } from ".";

export class AppNotifier implements Notifier {

    private option?: NotifierOption
    constructor(option?: NotifierOption) {
        this.option = {
            ...option
        }
    }

    send(recepients: string[], option?: SendOption): Promise<void> {
        // TODO:
        throw new Error('In-app notifier is not implemented')
    }
}