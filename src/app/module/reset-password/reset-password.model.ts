import { BaseValidator } from "@/lib/validator"
import { FormatRegistry, Static, Type } from "@sinclair/typebox"
import { Selectable } from "kysely"
import { ResetPasswords } from 'kysely-codegen'

export type ResetPassword = Selectable<ResetPasswords>

FormatRegistry.Set('email', value => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
})

const createResetPasswordSchema = Type.Object({
    email: Type.String({ format: 'email' }),
})

type CreateResetPasswordSchema = typeof createResetPasswordSchema
export type CreateResetPassword = Static<CreateResetPasswordSchema>

export class CreateResetPasswordValidator extends BaseValidator<CreateResetPasswordSchema> {
    constructor(data: any) {
        super(data)
    }
    
    protected schema(): CreateResetPasswordSchema {
        return createResetPasswordSchema
    }
}

export function resetPassword(data: any) {
    return new CreateResetPasswordValidator(data)
}