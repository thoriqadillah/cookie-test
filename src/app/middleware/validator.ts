import { Request, Response, NextFunction } from "express";
import { Validator } from "@/lib/validator";

export type ValidatorMiddleware = (data: any) => Validator
export function validate(validator: ValidatorMiddleware) {
    return (req: Request, res: Response, next: NextFunction) => {
        const v = validator(req.body)
        const message = v.validate() 

        message.length === 0 
            ? next()
            : res.status(400).send({ 
                code: 400,
                message,
                data: null,
            }) 
    }
}