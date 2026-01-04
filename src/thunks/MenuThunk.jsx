import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../api/api";

const menuThunk = createAsyncThunk(
    'modules/menu',
    async (payload, {rejectWithValue}) => {
        try{
            const response = await API.post(
                `/api/v2/maghil-display/menu`,
                payload
            )
            return response.data
        }catch(error){
            return rejectWithValue(error.message)
        }
    }
)

export {menuThunk}