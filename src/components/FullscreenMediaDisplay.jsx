import React, { useEffect, useRef } from "react";

const FullscreenMediaDisplay = ({ 
    media, 
    preloadedElement,
    onExit, 
    isPlaying,
    currentIndex 
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current?.requestFullscreen) {
            containerRef.current.requestFullscreen().catch(console.error);
        }
    }, [media]);

    if (!media) return null;

    return (
        <div 
            ref={containerRef}
            className="fullscreen-media-container"
            onClick={onExit}
        >
            {preloadedElement ? (
                React.cloneElement(preloadedElement, {
                    className: "fullscreen-media",
                    autoPlay: media.mimeType.startsWith("video") ? isPlaying : undefined,
                    muted: media.mimeType.startsWith("video"),
                    playsInline: true
                })
            ) : (
                <div className="loading-overlay">
                    <div className="spinner-large"></div>
                    <div className="loading-content">Loading...</div>
                </div>
            )}
        </div>
    );
};


export default FullscreenMediaDisplay;
