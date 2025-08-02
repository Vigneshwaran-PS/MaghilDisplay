import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../api/api";


const moduleThunk = createAsyncThunk(
    '/dashboard/modules',
    async (locationId,{rejectWithValue}) => {

        try{
            const response = await API.get(
                `/api/v2/maghil-display/modules?locationId=${locationId}`
            )
            return response.data
        }catch(error){
            return rejectWithValue(error.message)
        }

    }
)

export {moduleThunk}