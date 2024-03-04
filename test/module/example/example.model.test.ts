import { expect, test } from "@jest/globals";
import { ExampleValidator } from "@/app/module/example/example.model";

test('payload example should be validated', () => {
    const payload = {
        foo: 'test',
        bar: 1
    }

    const validator = new ExampleValidator(payload)
    const messages = validator.validate()
    expect(messages.length).toBe(0)
})

test('payload example should not be validated', () => {
    let payload = {
        foo: '',
        bar: 1
    }

    let validator = new ExampleValidator(payload)
    let messages = validator.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        foo: '',
        bar: 0
    }

    validator = new ExampleValidator(payload)
    messages = validator.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        foo: 'test',
        bar: 0
    }

    validator = new ExampleValidator(payload)
    messages = validator.validate()
    expect(messages.length).toBeGreaterThan(0)
})
