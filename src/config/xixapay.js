import axios from "axios"
import process from "process"

const SECRET = process.env.XIXAPAY_SECRET
const APIKEY = process.env.XIXAPAY_API_KEY

export const xixaApi = axios.create({
    baseURL: " https://api.xixapay.com/api/v1",
    headers:{
        "Authorization": `Bearer ${SECRET}`,
        "Content-Type": "application/json",
        "api-key": `${APIKEY}`
    }
})