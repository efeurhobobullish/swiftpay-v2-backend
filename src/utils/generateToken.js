import jwt from "jsonwebtoken"
import process from "process"


export const generateToken = (userId)=>{
    return jwt.sign({userId}, process.env.SECRET, {expiresIn: "1d"})
}