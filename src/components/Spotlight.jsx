import React, { useEffect, useState } from 'react'
import '../styles/Spotlight.css'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom';
import { spotLightMediasThunk, spotLightThunk } from '../thunks/SpotLightThunk';
import noData from '../assets/icons/noData.png'
import playIcon from '../assets/icons/PlayIcon.png'
import viewDetails from '../assets/icons/ViewDetails.png'
import Loader from '../components/Loader.jsx'
import { showErrorToast } from '../slices/ErrorToastSlice.jsx';
import * as Colors from '../constants/Colors';

const Spotlight = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {locationId,templateId} = useParams()
    const selectedLocationId = localStorage.getItem('selectedLocation')
    const {data} = useSelector(state => state?.spotlight)
    const [spotlight,setSpotlight] = useState(null)
    const [loadingSpotLight,setLoadingSpotLight] = useState({});


    useEffect(() => {
        if(locationId && templateId){
            dispatch(spotLightThunk(
                {
                    locationId : selectedLocationId,
                    templateId,
                    type : "MEDIA"
                }
            ))
        }   
    },[locationId,templateId,selectedLocationId,dispatch])


    useEffect(() => {
        const getSpotLightModules = () => {
            if(data?.spotLightDisplays) {
                try {
                    const portraitSpotlights = data.spotLightDisplays.filter(
                        template => template?.orientation?.toLowerCase() === 'portrait'
                    );
                    const landscapeSpotlights = data.spotLightDisplays.filter(
                        template => template?.orientation?.toLowerCase() === 'landscape'
                    );
                    
                    setSpotlight({portraitSpotlights, landscapeSpotlights});
                } catch (error) {
                    console.error('Error processing spotlight data:', error);
                    setSpotlight({portraitSpotlights: [], landscapeSpotlights: []});
                }
            }
        }
        
        getSpotLightModules();
    }, [data])

    
    const playSpotLight = async (template, buttonType) => {
        if(!template?.displayId) {
            console.warn('No displayId found in template');
            return;
        }

        try {
            setLoadingSpotLight({
                loading : true,
                displayId : template.displayId,
                buttonType
            });
            
            const result = await dispatch(spotLightMediasThunk(template.displayId)).unwrap();
            
            if (!result?.spotLightDisplays || result.spotLightDisplays.length === 0) {
                dispatch(showErrorToast({
                    message: "There is no media to play the spotlight, please add some media.",
                    backGroundColor: Colors.MAGHIL
                }));
                return;
            }

            const displayData = result.spotLightDisplays[0];
            if (!displayData?.spotLightMedia || displayData.spotLightMedia.length === 0) {
                dispatch(showErrorToast({
                    message: "There is no media to play the spotlight, please add some media.",
                    backGroundColor: Colors.MAGHIL
                }));
                return;
            }

            navigate(`/dashboard/modules/spotlight/player/${template.displayId}`);
            
        } catch (error) {
            console.error("Error occurred while fetching medias:", error);
            dispatch(showErrorToast({
                message: "Failed to load media. Please try again.",
                backGroundColor: Colors.MAGHIL
            }));
        } finally {
            setLoadingSpotLight(null);
        }
    }

    const viewSpotlight = async (template,buttonType) => {
        if(template && template?.displayId){
            try {
                setLoadingSpotLight({
                    loading : true,
                    displayId : template.displayId,
                    buttonType
                });
                
                await dispatch(spotLightMediasThunk(template.displayId)).unwrap();
    
                navigate(`/dashboard/modules/spotlight/view/${template.displayId}`);
                
            } catch (error) {
                console.error("Error occurred while fetching medias:", error);
                dispatch(showErrorToast({
                    message: "Failed to load media. Please try again.",
                    backGroundColor: Colors.MAGHIL
                }));
            } finally {
                setLoadingSpotLight(null);
            }
        
        }

    }

    const navigateToCreateSpotlight = () => {
        navigate('/dashboard/modules/spotlight/config', { 
        state: { 
            isEdit: false, 
            locationId: selectedLocationId,
            templateId
        }});
    }

  return (
    <div className='spotlight-container'>
        <div className='add-new-spotlight' 
             data-tooltip="Add new spotlight"
             onClick={()=>navigateToCreateSpotlight()}
        >
            +
        </div>
        <div className='spotlight-wrapper'>
            <div className="spotlight-header">
                <h1>Spotlight</h1>            
            </div>
            {
                (spotlight?.portraitSpotlights?.length > 0 || spotlight?.landscapeSpotlights?.length > 0)
                ?   <div className="spotlight-content">
                        {
                            spotlight?.landscapeSpotlights?.length > 0 &&
                            <div className="spotlight-root">
                                <div className="spotlight-title">
                                    <h2>Landscape</h2>
                                </div>
                                <div className="spotlight-cards-container">
                                    {
                                        spotlight?.landscapeSpotlights.map(template => {
                                            return (
                                                <div className='spotlight-card-wrapper' key={template.displayId}>
                                                    <h2>{template.displayName.length >= 30 ? template.displayName.slice(0,30).concat("...") : template.displayName}</h2>
                                                    <div className="media-count">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                            <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
                                                        </svg>
                                                        {template.mediaCount} Media Items
                                                    </div>
                                                    <div className="spotlight-actions">
                                                        <button className="action-btn play-btn"
                                                                onClick={() => playSpotLight(template, 'play')}
                                                                disabled = {loadingSpotLight?.loading}
                                                        >
                                                            {
                                                                loadingSpotLight?.loading && 
                                                                loadingSpotLight?.displayId === template?.displayId &&
                                                                loadingSpotLight?.buttonType === 'play'
                                                                ? <Loader size='large' variant = 'dots'/>
                                                                : <>
                                                                    <picture className='play-icon'>
                                                                        <img src={playIcon} alt="" />
                                                                    </picture>
                                                                    <p>Play</p>
                                                                  </>
                                                            }
                                                        </button>
                                                    
                                                        <button className="action-btn view-btn"
                                                                disabled = {loadingSpotLight?.loading}
                                                                onClick={()=>viewSpotlight(template,'view')}
                                                        >
                                                            {
                                                                loadingSpotLight?.loading && 
                                                                loadingSpotLight?.displayId === template?.displayId &&
                                                                loadingSpotLight?.buttonType === 'view'
                                                                ? <Loader size='large' variant = 'dots'/>
                                                                : <>
                                                                    <picture className='play-icon'>
                                                                        <img src={viewDetails} alt="" />
                                                                    </picture>
                                                                    <p>View</p>
                                                                  </>
                                                            }
                                                           
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        }

                        {
                            spotlight?.portraitSpotlights?.length > 0 &&
                            <div className="spotlight-root">
                                <div className="spotlight-title">
                                    <h2>Portrait</h2>
                                </div>
                                <div className="spotlight-cards-container">
                                    {
                                        spotlight?.portraitSpotlights.map(template => {
                                            return (
                                                <div className='spotlight-card-wrapper' key={template.displayId}>
                                                    <h2>{template.displayName.length >= 30 ? template.displayName.slice(0,30).concat("...") : template.displayName}</h2>
                                                    <div className="media-count">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                            <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
                                                        </svg>
                                                        {template.mediaCount} Media Items
                                                    </div>
                                                    <div className="spotlight-actions">
                                                        <button className="action-btn play-btn"
                                                                onClick={() => playSpotLight(template,'play')}
                                                                disabled = {loadingSpotLight?.loading}
                                                        >
                                                            {
                                                                loadingSpotLight?.loading && 
                                                                loadingSpotLight?.displayId === template?.displayId &&
                                                                loadingSpotLight?.buttonType === 'play'
                                                                ? <Loader size='large' variant = 'dots'/>
                                                                : <>
                                                                    <picture className='play-icon'>
                                                                        <img src={playIcon} alt="" />
                                                                    </picture>
                                                                    <p>Play</p>
                                                                  </>
                                                            }
                                                        </button>

                                                        <button className="action-btn view-btn"
                                                                disabled = {loadingSpotLight?.loading}
                                                                onClick={()=>viewSpotlight(template, 'view')}
                                                        >
                                                            {
                                                                loadingSpotLight?.loading && 
                                                                loadingSpotLight?.displayId === template?.displayId &&
                                                                loadingSpotLight?.buttonType === 'view'
                                                                ? <Loader size='large' variant = 'dots'/>
                                                                : <>
                                                                    <picture className='play-icon'>
                                                                        <img src={viewDetails} alt="" />
                                                                    </picture>
                                                                    <p>View</p>
                                                                  </>
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        }
                    </div>
                :   <div className='no-spotlight-found'>
                        <div className="no-split-found-container">
                            <picture className="no-split-found-wrapper">
                                <img src={noData} alt="" />
                            </picture>
                            <h4>No Spotlight Found...</h4>
                        </div>
                    </div>      
            }
        </div>
    </div>
  )
}

export default Spotlight