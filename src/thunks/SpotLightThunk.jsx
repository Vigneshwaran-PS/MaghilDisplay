import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../api/api";


const spotLightThunk = createAsyncThunk(
    '/modules/spotlight',
    async (moduleRequest,{rejectWithValue}) => {
        try{
            const response = await API.post(
                `/api/v2/maghil-display/module-type`,
                moduleRequest
            )
            return response.data;
        }catch(error){
            return rejectWithValue(error.messge)
        }
    }
)

const spotLightMediasThunk = createAsyncThunk(
    "/modules/spotlight/medias",
    async (displayId,{rejectWithValue}) => {
        try{
            const response = await API.get(
                `/api/v2/maghil-display/display?displayId=${displayId}`
            )
            return response.data
        }catch(error){
            return rejectWithValue(error.message)
        }
    }
)

export {spotLightThunk, spotLightMediasThunk}