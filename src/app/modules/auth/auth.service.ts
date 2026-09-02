import { SignOptions } from "jsonwebtoken";
import config from "../../config"
import { prisma } from "../../lib/prisma"
import { jwtUtils } from "../../utils/jwt";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface"
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

const loginUserIntoDB = async(payload: ILoginUserPayload)=>{
    const {email, password} = payload
    if(!email){
        throw new Error("Email is required")
    }
    if(!password){
        throw new Error("Password is required")
    }

    const user = await prisma.user.findUniqueOrThrow({
        where: {email}
    })

    if(user.status === "BLOCKED"){
        throw new Error("Your account has been BLOCKED")
    }else if(user.status === "DELETED"){
        throw new Error("Your account has been DELETED")
    }

    if (!user.password) {
    throw new Error("Password is not set for this account");
    }

    const isPassMatched = await bcrypt.compare(password, user.password)
    if(!isPassMatched){
        throw new Error("Password is incorrect")
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role : user.role,
        accountStatus: user.status
    }
    const accessToken = jwtUtils.createToken(jwtPayload, config.JWT_ACCESS_SECRET, config.JWT_ACCESS_EXPIRES_IN as SignOptions)
    const refreshToken = jwtUtils.createToken(jwtPayload, config.JWT_REFRESH_SECRET, config.JWT_REFRESH_EXPIRES_IN as SignOptions)

    return {accessToken, refreshToken}
}

const getCurrentUserFromDB = async(userId : string)=>{
    const user = await prisma.user.findUniqueOrThrow({
        where: {id: userId},
        omit: {password: true}
    })

    return user
}


export const authService = {
    registerUserIntoDB,
    loginUserIntoDB,
    getCurrentUserFromDB
}