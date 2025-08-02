import React from 'react'
import '../styles/Loader.css'

const Loader = ({ 
    size = 'medium',           // 'small', 'medium', 'large', 'xl' or custom number
    variant = 'spinner',       // 'spinner', 'dots', 'pulse', 'bars', 'ring'
    color = 'primary',         // 'primary', 'white', 'dark', 'success', 'warning', 'error' or custom hex
    speed = 'normal',          // 'slow', 'normal', 'fast'
    overlay = false,           // true for full overlay loader
    text = '',                 // optional loading text
    className = '',            // additional custom classes
    style = {},                // additional inline styles
    customColor = null         // custom color override
}) => {
    // Build class names exactly like HTML version
    const getSizeClass = () => {
        if (typeof size === 'number') return ''
        return `loader-${size}`
    }

    const getColorClass = () => {
        return `loader-${color}`
    }

    const getSpeedClass = () => {
        return `loader-${speed}`
    }

    // Build the exact className string as HTML
    const loaderClasses = [
        'loader',
        getSizeClass(),
        getColorClass(),
        getSpeedClass(),
        className
    ].filter(Boolean).join(' ')

    // Build inline styles
    const inlineStyles = {
        ...(typeof size === 'number' && { 
            width: `${size}px`, 
            height: `${size}px`,
            fontSize: `${size * 0.1}px`
        }),
        ...(customColor && { '--loader-color': customColor }),
        ...style
    }

    // Render variant content exactly like HTML
    const renderVariantContent = () => {
        switch (variant) {
            case 'dots':
                return (
                    <div className="loader-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                )
            case 'pulse':
                return <div className="loader-pulse"></div>
            case 'bars':
                return (
                    <div className="loader-bars">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                )
            case 'ring':
                return <div className="loader-ring"></div>
            default: // spinner
                return <div className="loader-spinner"></div>
        }
    }

    // Overlay version - exact HTML structure
    if (overlay) {
        return (
            <div className="loader-overlay active">
                <div className="loader-overlay-content">
                    <div className={loaderClasses} style={inlineStyles}>
                        {renderVariantContent()}
                    </div>
                    {text && <div className="loader-text">{text}</div>}
                </div>
            </div>
        )
    }

    // Regular loader - exact HTML structure
    return (
        <div className={loaderClasses} style={inlineStyles}>
            {renderVariantContent()}
            {text && <span className="loader-text">{text}</span>}
        </div>
    )
}

// Utility class for programmatic usage (optional)
export class LoaderManager {
    static showOverlay(text = 'Loading...') {
        // This would work with a global overlay state management
        // Implementation depends on your state management solution
        console.log('Show overlay:', text)
    }

    static hideOverlay() {
        console.log('Hide overlay')
    }
}

export default Loader