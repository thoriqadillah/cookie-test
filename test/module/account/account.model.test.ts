import { Login, LoginValidator, Register, RegisterValidator } from "@/app/module/account/account.model";
import { expect, test } from "@jest/globals";
import { v4 } from "uuid";

test('payload register should be validated', () => {
    const payload: Register = {
        email: `testing@email.com`,
        first_name: 'John',
        last_name: 'Doe',
        password: '12345Abc'
    }

    const v = new RegisterValidator(payload)
    const messages = v.validate()
    
    expect(messages.length).toBe(0)
})

test('payload register should not be validated', () => {
    let payload: Register = {
        email: `${v4()}@mail`,
        first_name: 'John',
        last_name: 'Doe',
        password: '12345Abc'
    }

    let v = new RegisterValidator(payload)
    let messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        email: `testing@email.com`,
        first_name: '',
        last_name: '',
        password: '12345Abc'
    }

    v = new RegisterValidator(payload)
    messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        email: `testing@email.com`,
        first_name: 'John',
        last_name: 'Doe',
        password: ''
    }

    v = new RegisterValidator(payload)
    messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        email: `testing@email.com`,
        first_name: 'John',
        last_name: 'Doe',
        password: 'abcdefgh'
    }

    v = new RegisterValidator(payload)
    messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        email: `testing@email.com`,
        first_name: 'John',
        last_name: 'Doe',
        password: '12345678'
    }

    v = new RegisterValidator(payload)
    messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)
})

test('payload login should be validated', () => {
    const payload: Login = {
        email: `testing@email.com`,
        password: '12345Abc'
    }

    const v = new LoginValidator(payload)
    const messages = v.validate()
    expect(messages.length).toBe(0)
})

test('payload login should not be validated', () => {
    let payload: Login = {
        email: `${v4()}@mail`,
        password: '12345Abc'
    }

    let v = new LoginValidator(payload)
    let messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        email: `testing@email.com`,
        password: ''
    }

    v = new LoginValidator(payload)
    messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        email: `testing@email.com`,
        password: 'abcdefgh'
    }

    v = new LoginValidator(payload)
    messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)

    payload = {
        email: `testing@email.com`,
        password: '12345678'
    }

    v = new LoginValidator(payload)
    messages = v.validate()
    expect(messages.length).toBeGreaterThan(0)
})
