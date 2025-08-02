import { createAsyncThunk } from "@reduxjs/toolkit"
import { API } from "../api/api"
import { useSelector } from "react-redux"


const loginThunk = createAsyncThunk(
    '/login',
    async (credentials, {rejectWithValue}) => {

        try{
            const response = await API.post(
                '/merchants/staff/login',
                credentials
            )
            return response.data
        }catch(error){
            return rejectWithValue(error.message)
        }

    }
)


const restaurantSlugThunk = createAsyncThunk(
    '/login/slug',
    async (locationId, {rejectWithValue, getState}) => {

        try{
            const response = await API.get(
                `/merchants/location/${locationId}/details`
            )
            return response.data
        }catch(error){
            return rejectWithValue(error.message)
        }
    }
)

export {loginThunk, restaurantSlugThunk}