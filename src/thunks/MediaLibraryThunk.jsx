import { createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../api/api";


const mediaLibraryThunk = createAsyncThunk(
    "/dashboard/media-library",
    async (mediaRequest,{rejectWithValue}) => {

        try{
            const response = await API.post(
                `/api/v2/maghil-display/library`,
                mediaRequest
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


const deleteMediaThunk = createAsyncThunk(
    "/dashboard/delete-media",
    async (mediaId, {rejectWithValue}) => {

      try{
        const response = await API.delete(
          `/api/v2/maghil-display/library/delete?mediaId=${mediaId}`
        )
        return response.data
      }catch(error){
        return rejectWithValue(error.message)
      }
    }
)
  

export {mediaLibraryThunk, uploadMediaThunk, deleteMediaThunk}