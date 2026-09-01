import config from "../../config"
import { prisma } from "../../lib/prisma"
import { IRegisterUserPayload } from "./auth.interface"
import bcrypt from "bcryptjs";

const registerUserIntoDB = async(payload: IRegisterUserPayload) => {
    const {name, email, password, role} = payload

    const isUserExists = await prisma.user.findUnique({
        where: {email}
    })
    if(isUserExists){
        throw new Error("User already exists with this email!")
    }

    const hashedPass = await bcrypt.hash(password, Number(config.BCRYPT_SALT_ROUND))

    const createUser = await prisma.user.create({
        data: {
            name,
            email,
            password : hashedPass,
            role
        }
    })

    const result = await prisma.user.findUnique({
        where: {id: createUser.id},
        omit: {password: true}
    })

    return result;
}

export const authService = {
    registerUserIntoDB
}