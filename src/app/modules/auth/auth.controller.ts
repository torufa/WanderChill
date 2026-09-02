import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status"
import { authService } from "./auth.service"

const registerUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const payload = req.body
    const result = await authService.registerUserIntoDB(payload)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: {result}
    }) 
})

const loginUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const payload = req.body
    const {accessToken, refreshToken} = await authService.loginUserIntoDB(payload)
    
    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        secure: false,
        sameSite: "none",
        maxAge: 1000*60*60*24
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000*60*60*24*30
    })
    
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Login successful",
        data: {accessToken, refreshToken}
    }) 
})

const getCurrentUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const result = await authService.getCurrentUserFromDB(req.user?.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Current user retrieved successfully",
        data: { result }
    })
})


export const authController = {
    registerUser,
    loginUser,
    getCurrentUser
}