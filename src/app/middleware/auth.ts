import { env } from "@/lib/env";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AccountStore } from "../module/account/account.store";

// singleton store
const store = new AccountStore()

export async function auth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).send({ 
            code: 401,
            message: 'Unauthorized' ,
            data: null,
        })
    
        const token = authHeader.replace('Bearer ', '')
        const key = env.get('JWT_SIGNING_KEY').toString('secret')
        const { user } = jwt.verify(token, key) as jwt.JwtPayload
        
        req.user = await store.get(user)
        next()

    } catch (error) {
        return res.status(401).send({ 
            code: 401,
            message: 'Unauthorized' ,
            data: null,
        })
        
    }
}