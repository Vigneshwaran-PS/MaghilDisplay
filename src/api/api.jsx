import axios from 'axios'


const BASE_URL = import.meta.env.VITE_BASE_API_ENDPOINT
const GCP_URL = import.meta.env.VITE_GCP_URL;

const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
})


API.interceptors.request.use(
    (request) => {
        console.log("Request Interceptor - {} ",request)
        return request
    },
    (error) => {
        return Promise.reject(error)
    }
)


API.interceptors.response.use(
    (response) => {
        console.log("Response Interceptor - {} ",response)
        return response
    },
    (error) => {
        return Promise.reject(error)
    }
)

// -----------------------------------------------------------------------


const GCP_API = axios.create({
    baseURL: GCP_URL
})


export {API, GCP_API};