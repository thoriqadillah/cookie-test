import express, { Express, Request, Response } from "express";
import { Service } from "@/app";
import { validate } from "@/app/middleware/validator";
import { AccountStore } from "./account.store";
import { Login, register, login, updateProfile, UpdateProfile, ChangePassword, changePassword, User, Register } from "./account.model";
import { auth } from "@/app/middleware/auth";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { env } from "@/lib/env";
import { BrokerName, Priority, broker } from "@/lib/broker";
import { ResetPasswordStore } from "../reset-password/reset-password.store";
import { CreateResetPassword, resetPassword } from "../reset-password/reset-password.model";
import { google } from 'googleapis'
export class AccountService implements Service {

    private SECRET_KEY = env.get('JWT_SIGNING_KEY').toString('secret')
    private TOKEN_EXP = env.get('JWT_EXPIRATION').toString('1h')
    private REFRESH_TOKEN_EXP = env.get('JWT_REFRESH_TOKEN_EXPIRATION').toString('1d')
    private BROKER_DRIVER = env.get('BROKER_DRIVER').toString('event') as BrokerName
    private OAUTH_GOOGLE_ID = env.get('OAUTH_GOOGLE_ID').toString()
    private OAUTH_GOOGLE_SECRET = env.get('OAUTH_GOOGLE_SECRET').toString()

    private store = new AccountStore()
    private resetPassword = new ResetPasswordStore()

    private event = broker.create('event')
    private broker = broker.create(this.BROKER_DRIVER)

    private goauth

    constructor(private app: Express) {
        const BASE_URL = env.get('BASE_URL').toString()
        const PORT = env.get('PORT').toNumber()

        this.goauth = new google.auth.OAuth2({
            clientId: this.OAUTH_GOOGLE_ID,
            clientSecret: this.OAUTH_GOOGLE_SECRET,
            redirectUri: `${BASE_URL}:${PORT}/api/v1/auth/google/callback`
        })
    }

    register = async (req: Request, res: Response) => {
        try {
            const payload = req.body as Register
            const user = await this.store.create(payload)

            this.event.publish('user:created', { data: user.id })
            res.status(201).send({
                code: 201,
                message: 'Created',
                data: user
            })
            
        } catch (error) {
            res.status(500).send({
                code: 500,
                message: `${error}`,
                data: null
            })
        }
    }

    generateToken(res: Response, userId: string): { token: string, refreshToken: string } {
        const token = jwt.sign({ user: userId }, this.SECRET_KEY, {
            expiresIn: this.TOKEN_EXP,
        })

        const refreshToken = jwt.sign({ user: userId }, this.SECRET_KEY, {
            expiresIn: this.REFRESH_TOKEN_EXP
        })

        return {
            token,
            refreshToken
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const payload = req.body as Login
            const user = await this.store.login(payload)

            if (!user) {
                res.status(204).send({
                    code: 204,
                    message: 'Wrong email or password',
                    data: null
                })

                return
            }

            const { token, refreshToken } = this.generateToken(res, user.id)
            res.status(200)
                .cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    sameSite: 'strict',
                })
                .send({
                    code: 200,
                    message: 'Ok',
                    data: { token }
                })

        } catch (error) {
            res.status(500).send({
                code: 500,
                message: `${error}`,
                data: null
            })
        }
    }

    authGoogle = async (req: Request, res: Response) => {
        const redirect = this.goauth.generateAuthUrl({
            access_type: 'offline',
            include_granted_scopes: true,
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ]
        })

        res.redirect(redirect)
    }

    authGoogleCallback = async (req: Request, res: Response) => {
        const { code } = req.query
        const { tokens } = await this.goauth.getToken(code as string)
        this.goauth.setCredentials(tokens)

        const oauth = google.oauth2({
            auth: this.goauth,
            version: 'v2',
        })

        const { data } = await oauth.userinfo.get()
        const user = await this.store.getByEmail(data.email!)
        if (!user) {
            // TODO: save picture to s3, and then retrieve it 

            const name = data.name!.split(' ')
            const u = await this.store.create({
                email: data.email!,
                first_name: name[0],
                last_name: name[1] ?? '',
            })
            
            this.event.publish('user:created', { data: u.id })
            const { token, refreshToken } = this.generateToken(res, u.id)
            // TODO: redirect to frontend
            

            return
        }
        
        // TODO: redirect to frontend
        const { token, refreshToken } = this.generateToken(res, user.id)
    }

    verify = async (req: Request, res: Response) => {
        const code = req.query.code

        // TODO: verify email
        this.broker.publish('user:verify', { 
            priority: Priority.VERY_HIGH,
            data: req.user, 
        })

        res.send(200).send({
            code: 200,
            message: 'Ok',
            data: null
        })
    }

    getUser = (req: Request, res: Response) => {
        res.status(200).send({
            code: 200,
            message: 'Ok',
            data: req.user,
        })
    }

    refreshToken = async (req: Request, res: Response) => {
        const token = req.cookies['refreshToken']
        if (!token) return res.status(401).send({
            code: 401,
            message: 'Unauthorized',
            data: null
        })

        try {
            const decoded = jwt.verify(token, this.SECRET_KEY) as JwtPayload
            const newToken = jwt.sign({ user: decoded['user'] }, this.SECRET_KEY, {
                expiresIn: this.TOKEN_EXP
            })

            res.status(200)
                .send({
                    code: 200,
                    message: 'Ok',
                    data: {
                        token: newToken
                    }
                })

        } catch (error) {
            res.status(401).send({
                code: 401,
                message: `Unauthorized`,
                data: null
            })
        }
    }

    forgotPassword = async (req: Request, res: Response) => {
        try {
            const payload = req.body as CreateResetPassword
            const token = await this.resetPassword.create(payload.email)

            // TODO: send email
            this.broker.publish('user:forgot-password', {
                priority: Priority.VERY_HIGH,
                notifyType: ['email'],
                data: {
                    email: req.user?.email,
                    token,
                }
            })

            res.status(200).send({
                code: 200,
                message: 'Ok',
                data: null
            })

        } catch (error) {
            res.status(500).send({
                code: 500,
                message: `${error}`,
                data: null
            })
        }
    }

    changePassword = async (req: Request, res: Response) => {
        try {
            const payload = req.body as ChangePassword
            const valid = await this.resetPassword.verify(payload.token)
            if (!valid) return res.status(400).send({
                code: 400,
                message: 'Invalid token',
                data: null
            })

            await this.store.changePassword(payload.email, payload.password)
            await this.resetPassword.delete(payload.email)

            this.broker.publish('user:password-changed', {
                priority: Priority.VERY_HIGH,
                data: payload.email,
                notifyType: ['email']
            })

            res.send(200).send({
                code: 200,
                message: 'Ok',
                data: null
            })

        } catch (error) {
            res.status(500).send({
                code: 500,
                message: `${error}`,
                data: null
            })
        }

    }

    updateProfile = async (req: Request, res: Response) => {
        try {
            const payload = req.body as UpdateProfile
            const profile = await this.store.updateProfile(req.user!.id, payload)
            res.status(200).send({
                code: 200,
                message: 'Ok',
                data: profile
            })

        } catch (error) {
            res.status(500).send({
                code: 500,
                message: `${error}`,
                data: null
            })
        }
    }

    changePicture = async (req: Request, res: Response) => {
        try {
            // TODO: upload to s3
            const user = await this.store.updateProfile(req.user!.id, {
                // picture: 
            })

            res.status(200).send({
                code: 200,
                message: 'Ok',
                data: null
            })
            
        } catch (error) {
            res.status(500).send({
                code: 500,
                message: `${error}`,
                data: null
            })
        }
        
    }

    deactivate = async (req: Request, res: Response) => {
        try {
            const user = await this.store.deactivate(req.user!.id)

            res.status(200).send({
                code: 200,
                message: 'Ok',
                data: user
            })
            
        } catch (error) {
            res.status(500).send({
                code: 500,
                message: `${error}`,
                data: null
            })
        }
    }

    createRoutes(): void {
        const v1 = express.Router()
        v1.post('/auth/register', validate(register), this.register)
        v1.post('/auth/login', validate(login), this.login)
        v1.get('/auth/google', this.authGoogle)
        v1.get('/auth/google/callback', this.authGoogleCallback)
        v1.get('/auth/refresh-token', this.refreshToken)
        v1.post('/auth/forgot-password', validate(resetPassword), this.forgotPassword)
        v1.put('/auth/change-password', validate(changePassword), this.changePassword)
        v1.get('/auth/verify', auth, this.verify)
        
        v1.get('/user', auth, this.getUser)
        v1.put('/user', auth, validate(updateProfile), this.updateProfile)
        v1.put('/user/picture', auth, this.changePicture)
        v1.delete('/user', auth, this.deactivate)

        this.app.use('/api/v1', v1)
    }
}