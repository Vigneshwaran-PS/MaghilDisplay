import React, { useEffect, useState } from 'react'
import '../styles/MediaLibrary.css'
import { useDispatch, useSelector } from 'react-redux'
import { mediaLibraryThunk } from '../thunks/MediaLibraryThunk'
import noMediaFound from '../../src/assets/icons/NoMediaFound.png'
import { GCP_API } from '../api/api'

const MediaLibrary = () => {

    const dispatch = useDispatch()
    const {data} = useSelector(state => state.slug)
    const mediaLibrary = useSelector(state => state.mediaLibrary)

    const [fullScreenImage,setFullScreenImage] = useState(null)

    const openFullScreenImage = (imageUrl, imageName) => {
        setFullScreenImage({url : imageUrl, name : imageName})
    }
    
    const closeFullScreenImage = () => {
        setFullScreenImage(null)
    }

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if(event.key === 'Escape' && fullScreenImage){
                closeFullScreenImage()
            }
        }

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);

    },[fullScreenImage])

    useEffect(() => {
        console.log("Library",mediaLibrary)
    },[mediaLibrary])
  
    useEffect(() => {
        const locationId = data?.id
        if(locationId){
            dispatch(mediaLibraryThunk(locationId));
        }
    },[data])

    const getLibrarymedias = () => {
        const allMedia = mediaLibrary?.medias?.libraryMedia;
        if(allMedia){
            const portraitImages = allMedia.filter(media => media.mediaType === 'IMAGE' && media.orientation === 'PORTRAIT');
            const landscapeImages = allMedia.filter(media => media.mediaType === 'IMAGE' && media.orientation === 'LANDSCAPE');
            const portraitVideos = allMedia.filter(media => media.mediaType === 'VIDEO' && media.orientation === 'PORTRAIT');
            const landscapeVideos = allMedia.filter(media => media.mediaType === 'VIDEO' && media.orientation === 'LANDSCAPE');
            return {portraitImages, landscapeImages, portraitVideos, landscapeVideos}
        }
        return null
    }
    
    const medias = getLibrarymedias();

    const getMediaUrl = (mediaData) => {
        console.log(mediaData)

        const mediaId = mediaData?.mediaId;
        const mimeTye = mediaData?.mimeType;

        if(mediaId && mimeTye){
            const url = `${GCP_API.defaults.baseURL}/${mediaId}.${mimeTye.split('/')[1]}`
            console.log("URL", url)
            return url;
        }
        return ""
    }

    // Helper function to check if any media exists
    const hasAnyMedia = () => {
        if (!medias) return false;
        return (medias.landscapeImages?.length > 0) || 
               (medias.portraitImages?.length > 0) || 
               (medias.landscapeVideos?.length > 0) || 
               (medias.portraitVideos?.length > 0);
    }

    // Render media section helper
    const renderMediaSection = (mediaArray, type, orientation) => {
        if (!mediaArray || mediaArray.length === 0) return null;

        const isVideo = type === 'VIDEO';
        const containerClass = isVideo ? `video-container-${orientation.toLowerCase()}` : `image-container-${orientation.toLowerCase()}`;
        const headerClass = isVideo ? `video-header-${orientation.toLowerCase()}` : `image-header-${orientation.toLowerCase()}`;
        const listClass = isVideo ? `video-list-${orientation.toLowerCase()}` : `image-list-${orientation.toLowerCase()}`;
        const cardClass = isVideo ? `video-card-${orientation.toLowerCase()}` : `image-card-${orientation.toLowerCase()}`;
        const viewClass = isVideo ? `video-view-${orientation.toLowerCase()}` : `image-view-${orientation.toLowerCase()}`;
        const contentClass = isVideo ? `video-content-${orientation.toLowerCase()}` : `image-content-${orientation.toLowerCase()}`;
        const nameClass = isVideo ? 'video-name' : 'image-name';
        const sizeClass = isVideo ? 'video-size' : 'image-size';
        const timeClass = isVideo ? 'video-time' : 'image-time';
        const orientationClass = isVideo ? 'video-orientation' : 'image-orientation';
        
        const nameLength = orientation.toLowerCase() === 'landscape' ? 20 : 15;

        return (
            <div className={containerClass} key={`${type}-${orientation}`}>
                <div className={headerClass}>
                    <h1>{isVideo ? 'Videos' : 'Images'}</h1>
                    <span> - </span>
                    <p className={orientationClass}>({orientation})</p>
                </div>
                <div className={listClass}>
                    {mediaArray.map(media => (
                        <div className={cardClass} key={media.mediaId}>
                            <div className={viewClass}>
                                {isVideo ? (
                                    <video controls>
                                        <source src={getMediaUrl(media)} type={media.mimeType} />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <picture>
                                        <img 
                                            src={getMediaUrl(media)} 
                                            alt="" 
                                            onClick={() => openFullScreenImage(getMediaUrl(media), media.name)}
                                        />
                                    </picture>
                                )}
                            </div>
                            <div className={contentClass}>
                                <div className={nameClass}>
                                    <h4>Name:</h4>
                                    <p>{media.name.length >= nameLength ? media.name.slice(0,nameLength).concat(".....") : media.name}</p>
                                </div>
                                <div className={sizeClass}>
                                    <h4>Size:</h4>
                                    <p>{media.mediaSize}</p>
                                </div>
                                <div className={timeClass}>
                                    <h4>Uploaded At:</h4>
                                    <p>{media.createdTime}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className='media-library-container'>
            <div className="media-library-wrapper">
                <div className="media-library-header">
                    <h1>Media Library</h1>
                </div>
                {
                    !hasAnyMedia() 
                    ?   <div className='no-media-found'>
                           <picture className='no-media-found-picture'>
                                <img src={noMediaFound} alt="" />
                           </picture>
                           <div>No Media Found...</div>
                        </div>
                    :   <div className="all-library-medias">
                            {renderMediaSection(medias?.landscapeImages, 'IMAGE', 'Landscape')}
                            {renderMediaSection(medias?.portraitImages, 'IMAGE', 'Portrait')}
                            {renderMediaSection(medias?.landscapeVideos, 'VIDEO', 'Landscape')}
                            {renderMediaSection(medias?.portraitVideos, 'VIDEO', 'Portrait')}
                        </div>
                }
            </div>

            {
                fullScreenImage && (
                    <div className="fullscreen-overlay" onClick={closeFullScreenImage}>
                        <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                            <img src={fullScreenImage.url} alt={fullScreenImage.name} />            
                        </div>
                    </div>
            )}
        </div>
    )
}

export default MediaLibrary