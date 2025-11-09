import axios from "axios";
import process from "process";



const apiToken = process.env.API_TOKEN

export const aodataApi = axios.create({
    baseURL: process.env.BASE_URL,
    headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true
})


