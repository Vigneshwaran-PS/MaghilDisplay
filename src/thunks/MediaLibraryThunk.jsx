import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";


const mediaLibraryThunk = createAsyncThunk(
    "/dashboard/media-library",
    async (locationId,{rejectWithValue}) => {

        try{
            const response = await API.get(
                `/api/v2/maghil-display/library?locationId=${locationId}`
            );
            return response.data
        }catch(error){
            return rejectWithValue(error.message)
        }

    }
)


const uploadMediaThunk = createAsyncThunk(
    '/dashboard/upload-media',
    async (uploadMediaRequest, { rejectWithValue }) => {
      try {

        const formData = new FormData();
        formData.append('image', uploadMediaRequest.file);
        formData.append('imageName', uploadMediaRequest.mediaName);
        formData.append('locationId', uploadMediaRequest.locationId);
        formData.append('description', '');
        formData.append('orientation', uploadMediaRequest.orientation);
  
        const response = await API.post(
          '/api/v2/maghil-display/library/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
  
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  

export {mediaLibraryThunk, uploadMediaThunk}