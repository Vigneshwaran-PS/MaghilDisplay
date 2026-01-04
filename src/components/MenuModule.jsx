import React, { useEffect, useState } from 'react'
import '../styles/MenuModule.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import noData from '../assets/icons/noData.png'
import { deleteSpotLightThunk, spotLightMediasThunk, spotLightThunk } from '../thunks/SpotLightThunk';
import playIcon from '../assets/icons/PlayIcon.png'
import viewDetails from '../assets/icons/ViewDetails.png'
import Loader from '../components/Loader.jsx'
import { showErrorToast } from '../slices/ErrorToastSlice';
import * as Colors from '../constants/Colors';


const MenuModule = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {locationId, templateId} = useParams()
    const selectedLocationId = localStorage.getItem('selectedLocation')
    const {data} = useSelector(state => state?.spotlight)
    const [spotlight,setSpotlight] = useState(null)
    const [loadingMenuTemplate,setLoadingMenuTemplate] = useState({});
    const [showDeletePopUp, setShowDeletePopUp] = useState(null)

    const editMenuModule = () => {
        navigate("/dashboard/modules/menu/config", { 
            state: {
                locationId,
                templateId
            }});
    }

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
        const getMenuModules = () => {
            if(data?.spotLightDisplays) {
                try {
                    const potraitMenuTempate = data.spotLightDisplays.filter(
                        template => template?.orientation?.toLowerCase() === 'portrait'
                    );
                    const landscapeMenuTempate = data.spotLightDisplays.filter(
                        template => template?.orientation?.toLowerCase() === 'landscape'
                    );
                    
                    setSpotlight({potraitMenuTempate, landscapeMenuTempate});
                } catch (error) {
                    console.error('Error processing spotlight data:', error);
                    setSpotlight({potraitMenuTempate: [], landscapeMenuTempate: []});
                }
            }
        }
        
        getMenuModules();
    }, [data])

    const handleDelete = (display) => {
        if(display && display?.displayId){
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
    
      const confirmDelete = async() => {
        try {
          const response = await dispatch(deleteSpotLightThunk(showDeletePopUp?.displayId)).unwrap();
          
          if (response && response.error) {
            dispatch(showErrorToast({
              message: response.message || "Something went wrong while deleting spotlight, please try again later.",
              backGroundColor: Colors.MAGHIL
            }));
            return;
          }
      
          dispatch(showErrorToast({
            message: "Spotlight deleted successfully!",
            backGroundColor: Colors.SUCCESS_GREEN
          }));
      
    
          dispatch(spotLightThunk({
            locationId: selectedLocationId,
            templateId,
            type: "MEDIA"
          }));
        
          setSpotlight({potraitMenuTempate: [], landscapeMenuTempate: []});
      
          setTimeout(() => {
            closeDeletePopup();
          }, 500);
      
        } catch(error) {
          dispatch(showErrorToast({
            message: "Something went wrong, please try again later.",
            backGroundColor: Colors.MAGHIL
          }));
          console.log("Exception occured while deleting spotlight ", error);
        }
      };


      const playSpotLight = async (template, buttonType) => {
        if(!template?.displayId) {
            console.warn('No displayId found in template');
            return;
        }

        try {
            setLoadingMenuTemplate({
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
            setLoadingMenuTemplate(null);
        }
    }
    
  return (
    <div className='menu-module-container'>
        <div className='add-new-menu-module'
             onClick={() => editMenuModule()}  
        >
            +
        </div>
        <div className="menu-module-wrapper">
            <div className="menu-module-header">
                <h1>Menu's</h1>
            </div>
            {
                (spotlight?.potraitMenuTempate?.length > 0 || spotlight?.landscapeMenuTempate?.length > 0)
                ?   <div className="spotlight-content">
                        {
                            spotlight?.landscapeMenuTempate?.length > 0 &&
                            <div className="spotlight-root">
                                <div className="spotlight-title">
                                    <h2>Landscape</h2>
                                </div>
                                <div className="spotlight-cards-container">
                                    {
                                        spotlight?.landscapeMenuTempate.map(template => {
                                            return (
                                                <div className='spotlight-card-wrapper' key={template.displayId}>
                                                    <h2>{template.displayName.length >= 30 ? template.displayName.slice(0,30).concat("...") : template.displayName}</h2>
                                                    <div className="media-count">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                            <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
                                                        </svg>
                                                        {template.itemsCount} Items
                                                    </div>
                                                    <div className="spotlight-actions">
                                                        <button className="action-btn play-btn"
                                                                onClick={() => playSpotLight(template, 'play')}
                                                                disabled = {loadingMenuTemplate?.loading}
                                                        >
                                                            {
                                                                loadingMenuTemplate?.loading && 
                                                                loadingMenuTemplate?.displayId === template?.displayId &&
                                                                loadingMenuTemplate?.buttonType === 'play'
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
                                                                disabled = {loadingMenuTemplate?.loading}
                                                                onClick={() =>handleDelete(template)}
                                                        >
                                                            {
                                                                loadingMenuTemplate?.loading && 
                                                                loadingMenuTemplate?.displayId === template?.displayId &&
                                                                loadingMenuTemplate?.buttonType === 'view'
                                                                ? <Loader size='large' variant = 'dots'/>
                                                                : <>
                                                                    <picture className='play-icon'>
                                                                        <img src={viewDetails} alt="" />
                                                                    </picture>
                                                                    <p>Delete</p>
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
                            spotlight?.potraitMenuTempate?.length > 0 &&
                            <div className="spotlight-root">
                                <div className="spotlight-title">
                                    <h2>Portrait</h2>
                                </div>
                                <div className="spotlight-cards-container">
                                    {
                                        spotlight?.potraitMenuTempate.map(template => {
                                            return (
                                                <div className='spotlight-card-wrapper' key={template.displayId}>
                                                    <h2>{template.displayName.length >= 30 ? template.displayName.slice(0,30).concat("...") : template.displayName}</h2>
                                                    <div className="media-count">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                            <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
                                                        </svg>
                                                        {template.itemsCount} Items
                                                    </div>
                                                    <div className="spotlight-actions">
                                                        <button className="action-btn play-btn"
                                                                onClick={() => playSpotLight(template,'play')}
                                                                disabled = {loadingMenuTemplate?.loading}
                                                        >
                                                            {
                                                                loadingMenuTemplate?.loading && 
                                                                loadingMenuTemplate?.displayId === template?.displayId &&
                                                                loadingMenuTemplate?.buttonType === 'play'
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
                                                                disabled = {loadingMenuTemplate?.loading}
                                                                onClick={() =>handleDelete(template)}
                                                        >
                                                            {
                                                                loadingMenuTemplate?.loading && 
                                                                loadingMenuTemplate?.displayId === template?.displayId &&
                                                                loadingMenuTemplate?.buttonType === 'view'
                                                                ? <Loader size='large' variant = 'dots'/>
                                                                : <>
                                                                    <picture className='play-icon'>
                                                                        <img src={viewDetails} alt="" />
                                                                    </picture>
                                                                    <p>Delete</p>
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
                            <h4>No Menu's Found...</h4>
                        </div>
                    </div>      
            }
        </div>

        {showDeletePopUp && showDeletePopUp.deletePopup && showDeletePopUp.displayId && (
        <div className='spotlight-delete-overlay'>
          <div className='spotlight-delete-popup'>
            <div className="delete-popup-header">
              <h2>Confirm Delete</h2>
              <button className="close-btn" onClick={closeDeletePopup}>×</button>
            </div>
            <div className="delete-popup-content">
              <p>Are you sure you want to delete this menu template?</p>
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

export default MenuModule