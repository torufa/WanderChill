import { Router } from "express"
import { authController } from "./auth.controller"
import { Role } from "../../../../prisma/generated/prisma/enums"
import { auth } from "../../middleware/auth"

const route = Router()

route.post('/register', authController.registerUser)
route.post("/login", authController.loginUser)
// route.post("/refresh-token", authController.refreshToken)
route.get("/me",auth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN), authController.getCurrentUser)

export const authRoutes : Router = route