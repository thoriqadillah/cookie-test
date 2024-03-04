import { afterAll, beforeAll, expect, test } from "@jest/globals";
import { Visuwisu } from "@/app";
import express from 'express'
import request from 'supertest'
import dotenv from "dotenv";
import { Login, Register } from "@/app/module/account/account.model";
import { AccountStore, Store } from "@/app/module/account/account.store";
import { SettingStore, Store as StgStore } from "@/app/module/setting/setting.store";

dotenv.config({ override: true, path: './.env.test' })
const app = express()
const vw = new Visuwisu(app)
let store: Store
let settingStore: StgStore

beforeAll(() => {
    vw.start()
    store = new AccountStore()
    settingStore = new SettingStore()
})

afterAll(() => {
    vw.shutdown()
})

test('POST /auth/register endpoint should return created', async () => {
    const payload: Register = {
        email: `testing@email.com`,
        first_name: 'John',
        last_name: 'Doe',
        password: '12345Abc'
    }

    const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(payload)

    expect(res.statusCode).toBe(201)
    
    const user = await store.get(res.body.data.id)
    expect(user).toBeTruthy()

    const setting = await settingStore.get(user!.id)
    expect(setting).toBeTruthy()
})

test('POST /auth/register endpoint should return bad request', async () => {
    const payload: Register = {
        email: ``,
        first_name: 'John',
        last_name: 'Doe',
        password: '12345Abc'
    }

    const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(payload)

    expect(res.statusCode).toBe(400)
})

test('POST /auth/login endpoint should return ok', async () => {
    const login: Login = {
        email: 'testing@email.com',
        password: '12345Abc'
    }

    const res = await request(app)
        .post('/api/v1/auth/login')
        .send(login)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

    expect(res.statusCode).toBe(200)
})

test('POST /auth/login endpoint should return bad request', async () => {
    const login: Login = {
        email: ``,
        password: '12345Abc'
    }

    const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(login)

    expect(res.statusCode).toBe(400)
})

test('GET /user endpoint should return ok', async () => {
    // TODO:
})

test('GET /user endpoint should return empty content', async () => {
    // TODO:
})
