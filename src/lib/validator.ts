import { TObject } from "@sinclair/typebox";
import { Value } from '@sinclair/typebox/value'

export interface Validator {
    validate(): string[]
}

export abstract class BaseValidator<T extends TObject> implements Validator {

    constructor(protected data: any) {}

    protected abstract schema(): T

    validate(): string[] {
        return [...Value.Errors(this.schema(), this.data)]
            .map(el => `${el.message} of ${el.path}`)    
    }
}