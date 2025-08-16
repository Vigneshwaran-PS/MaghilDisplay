import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ViewSpotlight.css'
import options from '../assets/icons/settings1.png'
import noMediaFound from '../assets/icons/NoImageFound.png'
import { spotLightMediasThunk } from '../thunks/SpotLightThunk';
import { GCP_API } from '../api/api';

const ViewSpotlight = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {displayId} = useParams();
  const {displayData} = useSelector(state => state?.spotlight)
  const [showOptions, setShowOptions] = useState(false)
  const [showDeletePopUp, setShowDeletePopUp] = useState(null)
  const optionsRef = useRef(null)



  useEffect(() => {
    if (displayId && (!displayData || !displayData.spotLightDisplays)) {
        dispatch(spotLightMediasThunk(displayId));
    }
  }, [displayId, displayData, dispatch]);
  

  const toggleOptions = () => {
    setShowOptions(!showOptions)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleEdit = () => {
    setShowOptions(false)
    // Add your edit logic here
    console.log('Edit clicked')
    // navigate('/edit-spotlight')
  }

  const handleDelete = (display) => {
    setShowOptions(false)
    if(display && display?.displayId){
      console.log("Delete")
      setShowDeletePopUp({
        deletePopup: true,
        displayId: display?.displayId,
        displayName: display?.displayName
      })
    }
  }

  const closeDeletePopup = () => {
    setShowDeletePopUp(null)
  }


  const confirmDelete = () => {
    console.log('Deleting display:', showDeletePopUp?.displayId)
    setShowDeletePopUp(null)
  }


  const getDisplayName = (displayName) => {
    return displayName?.length >= 40
              ? displayName.slice(0,40).concat("...") 
              : displayName
  }

  // ✅ Cleaner version
  const getSpotLightMedias = () => {
    const medias = displayData?.spotLightDisplays?.[0]?.spotLightMedia;
    if (!medias || medias.length === 0) return null;
    
    return [...medias].sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0));
  }

  const getMediaUrl = (media) => {
    if(!media){
      return "";
    }
    const mediaId = media?.mediaId
    const mimeType = media?.mimeType.split('/')[1];
    
    return `${GCP_API.defaults.baseURL}/${mediaId}.${mimeType}`
}

  return (
    <div className='view-spotlight-container'>
      <div className="view-spotlight-wrapper">
        <div className="view-spotlight-header">
          <h1>{getDisplayName(displayData?.spotLightDisplays?.[0]?.displayName)}</h1>
          <div className="spotlight-options" ref={optionsRef}>
            <img 
              className={`spotlight-setting ${showOptions ? 'rotate-open' : 'rotate-close'}`}
              src={options} 
              alt="Options" 
              onClick={toggleOptions}
            />
            <div className={`options ${showOptions ? 'show' : ''}`}>
              <button onClick={handleEdit}>
                Edit
              </button>
              <button onClick={() =>handleDelete(displayData?.spotLightDisplays?.[0])} className="delete-option">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="spotlight-view-content">
            <div className="spotlight-display-details">
                <div className="spotlight-name">
                  <h3>Name</h3>
                  <span>:</span>
                  <p>{displayData?.spotLightDisplays?.[0]?.displayName}</p>
                </div>

                <div className="spotlight-orientation">
                  <h3>Orientation</h3>
                  <span>:</span>
                  <p>{displayData?.spotLightDisplays?.[0]?.orientation}</p>
                </div>

                <div className="spotlight-media-count">
                  <h3>Media count</h3>
                  <span>:</span>
                  <p>{displayData?.spotLightDisplays?.[0]?.mediaCount}</p>
                </div>
            </div>
            <div className="spotlight-media-details">
              <h1>Media's</h1>
                {
                  getSpotLightMedias() == null 
                  ? <div className='no-media-found'>
                      <div>
                        <img src={noMediaFound} alt="" />
                        <p>No Media Found</p>
                      </div>
                    </div>
                  : <div className={`spotlight-media-container ${displayData?.spotLightDisplays?.[0]?.orientation?.toLowerCase()}`}>
                      {
                        getSpotLightMedias()?.map(media => (
                          <div 
                            className={`spotlight-media-wrapper ${displayData?.spotLightDisplays?.[0]?.orientation?.toLowerCase()}`}
                            key={media?.mediaId}
                          >
                              <picture>
                                  {
                                    media?.mimeType?.split("/")?.[0] === 'image'
                                    ? <img src={getMediaUrl(media)} alt="" />
                                    : <video 
                                        src={getMediaUrl(media)}
                                        controls
                                        muted
                                      />
                                  }
                              </picture>
                              <div className={`spotlight-media-contenet ${displayData?.spotLightDisplays?.[0]?.orientation?.toLowerCase()}`}>
                                  <div className="media-name">
                                     <h3>Name</h3>
                                     <span>:</span>
                                     <p>{getDisplayName(media?.name)}</p>
                                  </div>
                                  <div className="media-sequence">
                                     <h3>Sequence</h3>
                                     <span>:</span>
                                     <p>{media?.sequenceNo}</p>
                                  </div>
                                  <div className="media-timing">
                                     <h3>Display Time</h3>
                                     <span>:</span>
                                     <p>{`${media?.displayTime} Sec`}</p>
                                  </div>
                              </div>
                          </div>
                        ))
                      }
                    </div>
                }
            </div>    
        </div>
      </div>
      {showDeletePopUp && showDeletePopUp.deletePopup && showDeletePopUp.displayId && (
        <div className='spotlight-delete-overlay'>
          <div className='spotlight-delete-popup'>
            <div className="delete-popup-header">
              <h2>Confirm Delete</h2>
              <button className="close-btn" onClick={closeDeletePopup}>×</button>
            </div>
            <div className="delete-popup-content">
              <p>Are you sure you want to delete this spotlight display?</p>
              <p className="display-name"><strong>{showDeletePopUp?.displayName}</strong></p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="delete-popup-actions">
              <button className="cancel-btn" onClick={closeDeletePopup}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewSpotlight