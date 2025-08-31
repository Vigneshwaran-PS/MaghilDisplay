import React, { useEffect, useState, useRef } from 'react'
import '../styles/EditSpotlight.css'
import { useDispatch, useSelector } from 'react-redux'
import { saveSpotlightThunk, spotLightMediasThunk } from '../thunks/SpotLightThunk';
import { useLocation, useNavigate } from 'react-router-dom';
import { GCP_API } from '../api/api';
import noMediaFound from '../assets/icons/NoImageFound.png'
import Loader from '../components/Loader'
import { mediaLibraryThunk } from '../thunks/MediaLibraryThunk'
import { showErrorToast } from '../slices/ErrorToastSlice.jsx';
import * as Colors from '../constants/Colors';

const EditSpotlight = () => {

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { displayId, isEdit, locationId, templateId } = location?.state || {};
  const {displayData} = useSelector(state => state?.spotlight)
  const {medias} = useSelector(state => state?.mediaLibrary)
  const [editDisplay, setEditDisplay] = useState({});
  const [sortedMedias, setSortedMedias] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [videoDurations, setVideoDurations] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [chooseImage,setChooseImage] = useState(false);
  const [mediasLoading,setMediasLoading] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState(new Set()); 
  const [currentOrientation, setCurrentOrientation] = useState('LANDSCAPE');
  const videoRefs = useRef({});

  useEffect(() => {
    if (!isEdit && !editDisplay.orientation) {
      setEditDisplay(prev => ({
        ...prev,
        orientation: 'LANDSCAPE',
        displayName: '',
      }));
      setCurrentOrientation('LANDSCAPE');
    }
  }, [isEdit]);

  useEffect(() => {
    if (!displayId) {
      if (!isEdit) {
        setEditDisplay({
          orientation: 'LANDSCAPE',
          displayName: '',
          spotLightMedia: []
        });
        setCurrentOrientation('LANDSCAPE');
      }
      return;
    }

    if (displayData?.spotLightDisplays?.[0] && displayId === displayData?.spotLightDisplays?.[0]?.displayId) {
      setEditDisplay(displayData?.spotLightDisplays[0]);
    } else {
      fetchDisplayDetails(displayId);
    }
  }, [displayId, displayData, isEdit]);

  const fetchDisplayDetails = async (id) => {
    try {
      const response = await dispatch(spotLightMediasThunk(id)).unwrap();
      if (response && response?.spotLightDisplays?.[0]) {
        setEditDisplay(response?.spotLightDisplays?.[0]);
      }
    } catch (error) {
      console.error("Error fetching display details:", error);
      navigate(-1);
    }
  };

  const getSpotLightMedias = () => {
    const medias = editDisplay?.spotLightMedia;
    if (!medias || medias.length === 0) return null;
    
    return [...medias].sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0));
  }

  useEffect(() => {
    const medias = getSpotLightMedias();
    if (medias) {
      const mediasWithDefaults = medias.map(media => ({
        ...media,
        displayTime: (media.displayTime === undefined || media.displayTime === null) && media?.mimeType?.split("/")?.[0] === 'image' 
          ? 15 
          : media.displayTime
      }));
      setSortedMedias(mediasWithDefaults);
      
      // Initialize selectedMediaIds with current spotlight media
      const currentMediaIds = new Set(mediasWithDefaults.map(media => media.mediaId));
      setSelectedMediaIds(currentMediaIds);
    }
    
    // Sync orientation state - ensure we always have a valid orientation
    const orientation = editDisplay?.orientation || 'LANDSCAPE';
    setCurrentOrientation(orientation);
  }, [editDisplay]);

  const getMediaUrl = (media) => {
    if(!media){
      return "";
    }
    const mediaId = media?.mediaId
    
    let fileExtension;
    if (media?.mimeType) {
      fileExtension = media.mimeType.split('/')[1];
    } else if (media?.mediaType) {
      fileExtension = media.mediaType.toLowerCase() === 'image' ? 'jpg' : 'mp4';
    } else {
      fileExtension = 'jpg';
    }
    
    return `${GCP_API.defaults.baseURL}/${mediaId}.${fileExtension}`
  }

  const getMediaName = (displayName) => {
    return displayName?.length >= 40
              ? displayName.slice(0,40).concat("...") 
              : displayName
  }

  // Handle video metadata loading
  const handleVideoLoadedMetadata = (mediaId, duration) => {
    const durationInSeconds = Math.floor(duration);
    setVideoDurations(prev => ({
      ...prev,
      [mediaId]: durationInSeconds
    }));
    
    handleDisplayTimeChange(mediaId, durationInSeconds);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newMedias = [...sortedMedias];
    const draggedItem = newMedias[draggedIndex];
    
    // Remove dragged item and insert at new position
    newMedias.splice(draggedIndex, 1);
    newMedias.splice(dropIndex, 0, draggedItem);
    
    // Update sequence numbers
    const updatedMedias = newMedias.map((media, index) => ({
      ...media,
      sequenceNo: index + 1
    }));
    
    setSortedMedias(updatedMedias);
    setDraggedIndex(null);
    
    // Update editDisplay with new media order
    setEditDisplay(prev => ({
      ...prev,
      spotLightMedia: updatedMedias
    }));
  };

  // Handle input changes
  const handleDisplayNameChange = (e) => {
    setEditDisplay(prev => ({
      ...prev,
      displayName: e.target.value
    }));
  };

  const handleOrientationChange = (e) => {
    const newOrientation = e.target.value;
    setCurrentOrientation(newOrientation);
    
    if (!isEdit) {
      setSortedMedias([]);
      setSelectedMediaIds(new Set());
      setEditDisplay(prev => ({
        ...prev,
        orientation: newOrientation,
        spotLightMedia: []
      }));
    } else {
      setEditDisplay(prev => ({
        ...prev,
        orientation: newOrientation
      }));
    }
  };

  const handleDisplayTimeChange = (mediaId, newTime) => {
    // Find the media to check its type
    const targetMedia = sortedMedias.find(media => media.mediaId === mediaId);
    const mediaType = targetMedia?.mimeType?.split("/")?.[0];
    
  
    if (!/^\d*$/.test(newTime)) {
      return;
    }
  
    let finalValue = newTime;
  
    if (mediaType === 'image') {
      if (newTime === '') {
        finalValue = '';
      } else {
        const numericValue = parseInt(newTime);
        if (!isNaN(numericValue) && numericValue > 15) {
          finalValue = '15';
        } else if (!isNaN(numericValue) && numericValue < 0) {
          finalValue = '';
        } else {
          finalValue = newTime;
        }
      }
    }
    
    const updatedMedias = sortedMedias.map(media => {
      if (media.mediaId === mediaId) {
        return { 
          ...media, 
          displayTime: finalValue === '' ? '' : finalValue
        };
      }
      return media;
    });
    
    setSortedMedias(updatedMedias);
    setEditDisplay(prev => ({
      ...prev,
      spotLightMedia: updatedMedias
    }));
  };

  // Get placeholder text for display time input
  const getDisplayTimePlaceholder = (media) => {
    const mediaType = media?.mimeType?.split("/")?.[0] || media?.mediaType?.toLowerCase();
    if (mediaType === 'video') {
      return videoDurations[media.mediaId] ? `${videoDurations[media.mediaId]} sec` : 'Loading...';
    } else {
      return 'Min: 5 sec, Max: 15 sec';
    }
  };

  const isMediaDisplayTimeValid = (media) => {
    const mediaType = media?.mimeType?.split("/")?.[0] || media?.mediaType?.toLowerCase();
    const displayTime = media.displayTime;
    
    if (mediaType === 'image') {
      if (displayTime === '' || displayTime === 0) return false;
      const numericValue = typeof displayTime === 'string' ? parseInt(displayTime) : displayTime;
      return !isNaN(numericValue) && numericValue >= 5 && numericValue <= 15;
    } else if (mediaType === 'video') {
      const videoDuration = videoDurations[media.mediaId];
      return videoDuration && displayTime === videoDuration;
    }
    return false;
  };

  // Validation
  const isFormValid = () => {
    return (
      editDisplay?.displayName?.trim() &&
      editDisplay?.orientation &&
      sortedMedias?.length > 0 &&
      sortedMedias.every(media => isMediaDisplayTimeValid(media))
    );
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      dispatch(showErrorToast({
        backGroundColor: Colors.MAGHIL,
        message: "Please fill the required details."
      }));
      return;
    }
  
    setIsSaving(true);
    try {
    
      const targetLocationId = locationId || displayData?.locationId || editDisplay?.locationId;
      
      if (!targetLocationId) {
        dispatch(showErrorToast({
          message: "Location information is required to save spotlight.",
          backGroundColor: Colors.MAGHIL
        }));
        return;
      }
  
      const saveData = {
        ...editDisplay,
        spotLightMedia: sortedMedias,
        locationId: targetLocationId,
        displayId,
        templateType: "MEDIA"
      };
  
      console.log('Saving spotlight data:', saveData);
      const response = await dispatch(saveSpotlightThunk(saveData)).unwrap();
      
      if (response && response.error) {
        dispatch(showErrorToast({
          message: response.message || "Something went wrong while saving spotlight, please try again later.",
          backGroundColor: Colors.MAGHIL
        }));
        return;
      }

  
      dispatch(showErrorToast({
        message: "Spotlight saved successfully!",
        backGroundColor: Colors.SUCCESS_GREEN
      }));
  
      console.log("Template ID" , displayData)
      navigate(`/dashboard/modules/spotlight/${locationId}/${templateId}`);
      
    } catch (error) {
      console.error('Error saving spotlight:', error);
      
      dispatch(showErrorToast({
        message: error.message || "Something went wrong while saving spotlight, please try again later.",
        backGroundColor: Colors.MAGHIL
      }));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate(-1);
  };

  const updateChooseImageState = () => {
    setChooseImage(!chooseImage)
  }

  const loadMediaByLocationAndOrientation = async(orientation) => {
    try{
        setMediasLoading(true)
        setChooseImage(true)
        
        // Get locationId from multiple possible sources
        const targetLocationId = locationId || displayData?.locationId || editDisplay?.locationId;
        
        // Use current orientation if none provided
        const targetOrientation = orientation || currentOrientation || 'LANDSCAPE';
        
        console.log('Loading media with:', { locationId: targetLocationId, orientation: targetOrientation });
        
        if(targetOrientation && targetLocationId){
          const response = await dispatch(mediaLibraryThunk({
            locationId : targetLocationId,
            orientation: targetOrientation
          })).unwrap()
          
          if (!response || (response.error)) {
            dispatch(showErrorToast({
              message: "Something went wrong, please try again later.",
              backGroundColor: Colors.MAGHIL
            }));
            return;
          }
        } else {
          dispatch(showErrorToast({
            message: "Location information is required to load media.",
            backGroundColor: Colors.MAGHIL
          }));
          setChooseImage(false);
        }
    }catch(error){
      dispatch(showErrorToast({
        message: "Something went wrong, please try again later.",
        backGroundColor: Colors.MAGHIL
      }));
      setChooseImage(false);
      console.log("Exception occured while loading media ",error)
    }finally{
      setMediasLoading(false)
    }
  }

  const isMediaSelected = (media) => {
    return selectedMediaIds.has(media?.mediaId);
  }


  const handleMediaSelect = (media, isChecked) => {
    const newSelectedIds = new Set(selectedMediaIds);
    
    if (isChecked) {
      newSelectedIds.add(media.mediaId);
      
      const mediaExists = sortedMedias.find(m => m.mediaId === media.mediaId);
      if (!mediaExists) {
        let mimeType;
        if (media?.mediaType?.toLowerCase() === 'image') {
          mimeType = media?.mimeType || 'image/jpeg';
        } else {
          mimeType = media?.mimeType || 'video/mp4';
        }
        
        const newMedia = {
          ...media,
          sequenceNo: sortedMedias.length + 1,
          displayTime: media?.mediaType?.toLowerCase() === 'image' ? 15 : undefined,
          mimeType: mimeType
        };
        
        const updatedSortedMedias = [...sortedMedias, newMedia];
        setSortedMedias(updatedSortedMedias);
        
        setEditDisplay(prev => ({
          ...prev,
          spotLightMedia: updatedSortedMedias
        }));
      }
    } else {
      // Remove media from selection
      newSelectedIds.delete(media.mediaId);
      
      // Remove from sortedMedias
      const updatedSortedMedias = sortedMedias.filter(m => m.mediaId !== media.mediaId);
      
      // Update sequence numbers
      const resequencedMedias = updatedSortedMedias.map((m, index) => ({
        ...m,
        sequenceNo: index + 1
      }));
      
      setSortedMedias(resequencedMedias);
      
      // Update editDisplay
      setEditDisplay(prev => ({
        ...prev,
        spotLightMedia: resequencedMedias
      }));
    }
    
    setSelectedMediaIds(newSelectedIds);
  };


  const handleApplySelection = () => {
    setChooseImage(false);
  };

  const getOrientation = () => {
    return (currentOrientation || editDisplay?.orientation || 'LANDSCAPE').toLowerCase();
  };

  return (
    <div className='edit-spotlight-container'>
      <div className='edit-spotlight-wrapper'>
          <div className="edit-spotlight-header">
            <h2>{isEdit ? "Edit Spotlight" : "New Spotlight"}</h2>
          </div>

          <div className="display-configuration">
              <div className="display-config-header">
                  Display Configuration
              </div>

              <div className="display-config-name">
                <h4>Display Name:</h4>
                <input 
                  type="text" 
                  value={editDisplay?.displayName || ''}
                  name='displayName'
                  onChange={handleDisplayNameChange}
                  placeholder="Enter display name"
                />
              </div>

              <div className="display-config-type">
                <h4>Orientation:</h4>
                <select 
                  name="orientation"
                  disabled={isEdit}
                  value={editDisplay?.orientation || 'LANDSCAPE'}
                  onChange={handleOrientationChange}
                >
                  <option value="LANDSCAPE">LANDSCAPE</option>
                  <option value="PORTRAIT">PORTRAIT</option>
                </select>
              </div>
          </div>

          <div className="edit-display-medias">
                <div className='edit-display-add-media'
                     onClick={() => loadMediaByLocationAndOrientation(currentOrientation)}
                >
                  +
                </div>
                
                <div className="edit-display-medias-header">
                    Media's
                </div>
                
                <div className="edit-display-media-container">
                  {
                    sortedMedias.length === 0
                    ? <div className='edit-display-no-media-found'>
                        <div>
                          <img src={noMediaFound} alt="" />
                          <p>No Media Found</p>
                        </div>
                      </div>
                    
                    : <div className={`edit-display-media-wrapper ${getOrientation()}`}>
                        {
                          sortedMedias?.map((media, index) => {
                            const mediaType = media?.mimeType?.split("/")?.[0] || media?.mediaType?.toLowerCase();
                            const isVideo = mediaType === 'video';
                            const videoDuration = videoDurations[media.mediaId];
                            
                            return (
                              <div 
                                className={`edit-display-each-media ${getOrientation()} ${draggedIndex === index ? 'dragging' : ''}`}
                                key={media?.mediaId}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                style={{ cursor: 'move' }}
                              >
                                  <div className="drag-handle">
                                    <span>⋮⋮</span>
                                  </div>
                                  
                                  <picture>
                                      {
                                        mediaType === 'image'
                                        ? <img src={getMediaUrl(media)} alt="" />
                                        : <video 
                                            ref={el => videoRefs.current[media.mediaId] = el}
                                            src={getMediaUrl(media)}
                                            controls
                                            muted
                                            onLoadedMetadata={(e) => handleVideoLoadedMetadata(media.mediaId, e.target.duration)}
                                          />
                                      }
                                  </picture>
                                  
                                  <div className={`spotlight-media-content ${getOrientation()}`}>
                                      <div className="edit-spotlight-media-name">
                                        <h3>Name</h3>
                                        <span>:</span>
                                        <p>{getMediaName(media?.name)}</p>
                                      </div>
                                      
                                      <div className="edit-spotlight-media-sequence">
                                        <h3>Sequence</h3>
                                        <span>:</span>
                                        <p>{index + 1}</p>
                                      </div>
                                      
                                      <div className="edit-spotlight-media-timing">
                                        <h3>Display Time</h3>
                                        <span>:</span>
                                        <div className="edit-spotlight-display-time-in-sec">
                                          <input 
                                            type="text" 
                                            value={isVideo ? videoDuration || '' : (media?.displayTime || '')}
                                            min={isVideo ? undefined : "5"}
                                            max={isVideo ? undefined : "15"}
                                            readOnly={isVideo}
                                            onChange={isVideo ? undefined : (e) => handleDisplayTimeChange(media.mediaId, e.target.value)}
                                            placeholder={getDisplayTimePlaceholder(media)}
                                            style={isVideo ? {cursor: 'not-allowed' } : {}}
                                          />
                                          <p>Sec</p>
                                        </div>
                                      </div>
                                  </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    }
                  </div>
              </div>

              <div className="edit-spotlight-actions">
                <button 
                  type="button" 
                  className="edit-spotlight-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="edit-spotlight-save-btn"
                  onClick={handleSave}
                  disabled={!isFormValid() || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
      </div>
      {
        chooseImage && 
        <div className='choose-media-overlay-container'>
            <div className="close-media-overlay-container"
              onClick={() => updateChooseImageState()}
            >
              &times;
            </div>

            {
              mediasLoading ?
              <div className="edit-spotlight-media-loader">
                <Loader variant = 'spinner' size='large'/>
              </div> :

              <div className="close-media-overlay-wrapper">
                <div className="close-media-overlay-header">
                  <h1>Media's</h1>
              </div>
              
              <div className={`edit-dislay-medias-container ${getOrientation()}`}>
                    <div className={`edit-display-medias-wrapper ${getOrientation()}`}>
                      {
                        medias?.libraryMedia?.length > 0 ? 
                        medias?.libraryMedia?.map(media => {
                          const isSelected = isMediaSelected(media);
                          return <div className={`edit-display-single-media ${getOrientation()} ${isSelected ? 'selected' : ''}`}
                                      key={media?.mediaId}
                                >
                                    <div className="is-media-selected">
                                      <input type="checkbox" 
                                            checked={isSelected}
                                            onChange={(e) => handleMediaSelect(media, e.target.checked)}
                                      />
                                    </div>

                                    <picture className={`edit-display-single-media-picture ${getOrientation()}`}>
                                      {
                                          media?.mediaType?.toLowerCase() === 'image'
                                          ? <img src={getMediaUrl(media)} alt="" 
                                                className={`edit-display-single-media-img ${getOrientation()}`}
                                            />
                                          : <video 
                                              className={`edit-display-single-media-video ${getOrientation()}`}
                                              ref={el => videoRefs.current[media.mediaId] = el}
                                              src={getMediaUrl(media)}
                                              controls
                                              muted
                                            />
                                        }
                                    </picture>

                                    <div className={`edit-display-single-media-content ${getOrientation()}`}>
                                        <div className="edit-display-single-media-name">
                                            <div>Name</div>
                                            <span>:</span>
                                            <div>{getMediaName(media?.name)}</div>
                                        </div>

                                        <div className="edit-display-single-media-size">
                                            <div>Size</div>
                                            <span>:</span>
                                            <div>{media?.mediaSize}</div>
                                        </div>
                                    </div>
                                </div>
                        }) :
                        <div className='edit-display-no-media-found'>
                          <div>
                            <img src={noMediaFound} alt="" />
                            <p>No Media Found for {getOrientation()} orientation</p>
                          </div>
                        </div>
                      }
                    </div>
                </div>
              
            </div>
            }
        </div>  
      }
    </div>
  )
}

export default EditSpotlight