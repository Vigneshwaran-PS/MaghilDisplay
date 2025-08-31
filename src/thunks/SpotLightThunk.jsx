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


const saveSpotlightThunk = createAsyncThunk(
    "/modules/save/spotlight",
    async(spotlightData, {rejectWithValue}) => {
        try{
            const response = await API.post(
                "/api/v2/maghil-display/save-spotlight",
                spotlightData
            )
            return response.data;
        }catch(error){
            return rejectWithValue(error.message)
        }
    }
)


const deleteSpotLightThunk = createAsyncThunk(
    "/modules/remove/spotlight",
    async(displayId, {rejectWithValue}) => {
        try{
            const response = await API.delete(
                `/api/v2/maghil-display/remove-spotlight?displayId=${displayId}`
            )
            return response.data;
        }catch(error){
            return rejectWithValue(error.message)
        }
    }
)

export {spotLightThunk, spotLightMediasThunk, saveSpotlightThunk,deleteSpotLightThunk}