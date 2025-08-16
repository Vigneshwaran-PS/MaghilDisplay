import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import FullscreenMediaDisplay from '../components/FullscreenMediaDisplay';
import { spotLightMediasThunk } from '../thunks/SpotLightThunk';
import '../styles/SpotLightPlayer.css'
import { GCP_API } from '../api/api';

const SpotlightPlayer = () => {
    const { displayId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    

    const { displayData } = useSelector(state => state?.spotlight);
    const [sortedMediaList, setSortedMediaList] = useState([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [preloadedMedia, setPreloadedMedia] = useState({});
    const [isPreloading, setIsPreloading] = useState(true);
    
    const timerRef = useRef(null);

    
    useEffect(() => {
        if (displayData?.spotLightDisplays?.[0]?.spotLightMedia) {
            const mediaList = displayData.spotLightDisplays[0].spotLightMedia.map(m => ({
                ...m,
                url: getMediaUrl(m)
            }));
            const sortedMedia = mediaList.sort((a, b) => 
                (a.sequenceNo || 0) - (b.sequenceNo || 0)
            );
            preloadAllMedia(sortedMedia);
        }
    }, [displayData]);
    

    const preloadAllMedia = async (sortedMedia) => {
        setIsPreloading(true);
        setSortedMediaList(sortedMedia);
        
        const preloadPromises = sortedMedia.map(async (media, index) => {
            try {
                const type = media?.mimeType?.split('/')[0]?.toLowerCase();
                
                if (type === 'image') {
                    return preloadImage(media.url, index);
                } else if (type === 'video') {
                    return preloadVideo(media.url, index);
                }
            } catch (error) {
                console.error(`Failed to preload media ${index}:`, error);
                return null;
            }
        });
    
        const results = await Promise.allSettled(preloadPromises);
        const loadedMedia = {};
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                loadedMedia[index] = result.value;
            }
        });
    
        setPreloadedMedia(loadedMedia);
        setIsPreloading(false);
        setIsPlaying(true);
    };
    

    const getMediaUrl = (media) => {
        if(!media){
          return "";
        }
        const mediaId = media?.mediaId
        const mimeType = media?.mimeType.split('/')[1];
        
        return `${GCP_API.defaults.baseURL}/${mediaId}.${mimeType}`
    }

    const preloadImage = (url, index) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    type: 'image',
                    element: <img src={url} alt="" />,
                    index
                });
            };
            img.onerror = reject;
            img.src = url;
        });
    };
    

    const preloadVideo = (url, index) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.onloadeddata = () => {
                resolve({
                    type: 'video',
                    element: <video src={url} />,
                    index
                });
            };
            video.onerror = reject;
            video.src = url;
        });
    };
    

    // Media playback logic with proper displayTime handling
    const playCurrentMedia = useCallback(() => {
        if (!isPlaying || !sortedMediaList[currentMediaIndex]) return;

        const currentMedia = sortedMediaList[currentMediaIndex];
        
        console.log(`Playing media ${currentMediaIndex + 1}:`, {
            sequenceNo: currentMedia.sequenceNo,
            type: currentMedia.type,
            displayTime: currentMedia.displayTime,
            name: currentMedia.name || 'Unnamed'
        });
        
        if (currentMedia.type === 'VIDEO') {
            playVideo(currentMedia);
        } else {
            playImage(currentMedia);
        }
    }, [currentMediaIndex, isPlaying, sortedMediaList]);

    const playVideo = (media) => {
        const preloadedVideo = preloadedMedia[currentMediaIndex]?.element;
        if (preloadedVideo) {
            preloadedVideo.play();
            preloadedVideo.onended = moveToNextMedia;
        }
    };

    const playImage = (media) => {
        const displayTime = media.displayTime ? parseInt(media.displayTime) * 1000 : 5000;
        timerRef.current = setTimeout(moveToNextMedia, displayTime);
    };



    const moveToNextMedia = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        
        setCurrentMediaIndex(prev => {
            const nextIndex = prev + 1;
            if (nextIndex >= sortedMediaList.length) {
                return 0;
            }
            return nextIndex;
        });
    };


    useEffect(() => {
        const handleKeyPress = (e) => {
            switch(e.key) {
                case 'Escape':
                    exitPlayer();
                    break;
                case ' ':
                case 'Spacebar':
                    e.preventDefault();
                    setIsPlaying(prev => !prev);
                    break;
            }
        };
    
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);
    

    const exitPlayer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsPlaying(false);
        navigate(-1);
    };

    // Auto-play current media when index changes
    useEffect(() => {
        if (!isPreloading && isPlaying) {
            playCurrentMedia();
        }
    }, [currentMediaIndex, isPreloading, isPlaying, playCurrentMedia]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    
    useEffect(() => {
        if (!displayData && displayId) {
            dispatch(spotLightMediasThunk(displayId));
        }
    }, [displayId, displayData, dispatch]);

    if (!displayData) {
        return <div className="loading-overlay">Loading spotlight data...</div>;
    }


    return (
        <div className="spotlight-player">
            <FullscreenMediaDisplay 
                media={sortedMediaList[currentMediaIndex]}
                preloadedElement={preloadedMedia[currentMediaIndex]?.element}
                onExit={() => navigate(-1)}
                isPlaying={isPlaying}
                currentIndex={currentMediaIndex}
                totalMedia={sortedMediaList.length}
            />
        </div>
    );
};

export default SpotlightPlayer;