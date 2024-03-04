import { BaseValidator, Validator } from "@/lib/validator";
import { Type, Static, FormatRegistry } from "@sinclair/typebox";
import { Selectable } from "kysely"
import { Users } from "kysely-codegen"

export type User = Omit<Selectable<Users>, 'password'>

FormatRegistry.Set('password', value => {
    if (value.length < 8 || value.length > 16) {
        return false
    }

    return /[0-9]/.test(value) && /[a-zA-Z]/.test(value) && /[A-Z]/.test(value)
})

FormatRegistry.Set('email', value => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
})

const registerSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ format: 'password' }),
    first_name: Type.String({ minLength: 2 }),
    last_name: Type.String({ minLength: 2 }),
})

type RegisterSchema = typeof registerSchema
export type Register = Static<RegisterSchema>

export class RegisterValidator extends BaseValidator<RegisterSchema> {
    constructor(data: any) {
        super(data)
    }

    protected schema(): RegisterSchema {
        return registerSchema
    }
}

export function register(data: any): Validator {
    return new RegisterValidator(data)
}

const loginSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ format: 'password' }),
})

type LoginSchema = typeof loginSchema
export type Login = Static<LoginSchema>

export class LoginValidator extends BaseValidator<LoginSchema> {
    constructor(data: any) {
        super(data)
    }

    protected schema(): LoginSchema {
        return loginSchema
    }
}

export function login(data: any): Validator {
    return new LoginValidator(data)
}

const updateProfileSchema = Type.Object({
    first_name: Type.Optional(Type.String({ minLength: 2 })),
    last_name: Type.Optional(Type.String({ minLength: 2 })),
    email: Type.Optional(Type.String({ format: 'email' })),
    title: Type.Optional(Type.String()),
    phone: Type.Optional(Type.String()),
    picture: Type.Optional(Type.String()),
})

type UpdateProfileSchema = typeof updateProfileSchema
export type UpdateProfile = Static<UpdateProfileSchema>

export class UpdateProfileValidator extends BaseValidator<UpdateProfileSchema> {
    constructor(data: any) {
        super(data)
    }

    protected schema(): UpdateProfileSchema {
        return updateProfileSchema
    }
}


export function updateProfile(data: any): Validator {
    return new UpdateProfileValidator(data)
}

const changePasswordSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ format: 'password' }),
    token: Type.String(),
})

type ChangePasswordSchema = typeof changePasswordSchema
export type ChangePassword = Static<ChangePasswordSchema>

export class ChangePasswordValidator extends BaseValidator<ChangePasswordSchema> {
    constructor(data: any) {
        super(data)
    }
    
    protected schema(): ChangePasswordSchema {
        return changePasswordSchema
    }
}

export function changePassword(data: any): Validator {
    return new ChangePasswordValidator(data)
}