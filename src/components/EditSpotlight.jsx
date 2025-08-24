import React, { useEffect, useState } from 'react'
import '../styles/EditSpotlight.css'
import { useDispatch, useSelector } from 'react-redux'
import { spotLightMediasThunk } from '../thunks/SpotLightThunk';
import { useLocation } from 'react-router-dom';
import { GCP_API } from '../api/api';
import noMediaFound from '../assets/icons/NoImageFound.png'

const EditSpotlight = () => {

  const dispatch = useDispatch();
  const location = useLocation()

  const { displayId, isEdit } = location?.state || {};
  const {displayData} = useSelector(state => state?.spotlight)
  const [editDisplay,setEditDisplay] = useState({});


  const fetchDisplayDetails = async (id) => {
    try {
      const response = await dispatch(spotLightMediasThunk(id)).unwrap();
      if (response && response?.spotLightDisplays?.[0]) {
        setEditDisplay(response?.spotLightDisplays?.[0]);
      }
    } catch (error) {
      console.error("Error fetching display details:", error);
    }
  };

  const getSpotLightMedias = () => {
    const medias = editDisplay?.spotLightMedia;
    if (!medias || medias.length === 0) return null;
    
    return [...medias].sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0));
  }

  useEffect(() => {
    if (!displayId) return;

    if (displayData?.spotLightDisplays?.[0] && displayId === displayData?.spotLightDisplays?.[0]?.displayId) {
      setEditDisplay(displayData?.spotLightDisplays[0]);
    } else {
      fetchDisplayDetails(displayId);
    }
  }, [displayId, displayData]);


  const getMediaUrl = (media) => {
    if(!media){
      return "";
    }
    const mediaId = media?.mediaId
    const mimeType = media?.mimeType.split('/')[1];
    
    return `${GCP_API.defaults.baseURL}/${mediaId}.${mimeType}`
  }


  const getMediaName = (displayName) => {
    return displayName?.length >= 40
              ? displayName.slice(0,40).concat("...") 
              : displayName
  }

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
                <input type="text" 
                  value={editDisplay?.displayName}
                  name='displayName'
                />
              </div>

              <div className="display-config-type">
                <h4>Display Type:</h4>
                <select 
                  name="displayType"
                  disabled={isEdit}
                  value={editDisplay?.displayType}
                >
                  <option value="">LANSCAPE</option>
                  <option value="">PORTRAIT</option>
                </select>
              </div>
          </div>

          <div className="edit-display-medias">
                  <div className="edit-display-medias-header">
                    Media's
                  </div>
                  <div className="edit-display-media-container">
                  {
                    getSpotLightMedias() == null 
                    ? <div className='edit-display-no-media-found'>
                        <div>
                          <img src={noMediaFound} alt="" />
                          <p>No Media Found</p>
                        </div>
                      </div>
                    : <div className="edit-display-media-wrapper">
                        {
                          getSpotLightMedias()?.map(media => (
                            <div 
                              className={`edit-display-each-media ${displayData?.spotLightDisplays?.[0]?.orientation?.toLowerCase()}`}
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
                                      <p>{getMediaName(media?.name)}</p>
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
    </div>
  )
}

export default EditSpotlight