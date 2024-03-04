import { BaseValidator, Validator } from "@/lib/validator";
import { Static, Type } from "@sinclair/typebox";

const exampleSchema = Type.Object({
    foo: Type.String({
        minLength: 2,
        title: 'foo'
    }),
    bar: Type.Number({
        minimum: 1,
        title: 'bar'
    })
})

type Schema = typeof exampleSchema
export type Example = Static<Schema>

export class ExampleValidator extends BaseValidator<Schema> {
    constructor(data: any) {
        super(data)
    }

    protected schema(): Schema  {
        return exampleSchema
    }
}

export function example(data: any): Validator {
    return new ExampleValidator(data)
}