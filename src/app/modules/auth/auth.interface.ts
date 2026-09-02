import { Role, UserStatus } from "../../../../prisma/generated/prisma/enums";

export interface IRegisterUserPayload{
    name: string;
    email: string;
    password: string;
    role: Role;
    status : UserStatus
}

export interface ILoginUserPayload {
    email: string;
    password: string;
}