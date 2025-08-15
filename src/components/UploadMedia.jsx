import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showErrorToast } from '../slices/ErrorToastSlice'
import '../styles/UploadMedia.css'
import noImageFound from '../assets/icons/NoImageFound.png'
import fileUpload from '../assets/icons/fileupload.png'
import { uploadMediaThunk } from '../thunks/MediaLibraryThunk'
import Loader from './Loader'
import { useNavigate } from 'react-router-dom'
import * as Colors from '../constants/Colors';


 // File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg']
const SUPPORTED_VIDEO_TYPES = ['video/mp4']
const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES]

const UploadMedia = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const fileInputRef = useRef(null)
    const uploadMedia = useSelector(state => state.uploadMedia)
    const {data} = useSelector(state => state.slug);
    
    // State management
    const [selectedFile, setSelectedFile] = useState(null)
    const [mediaName, setMediaName] = useState('')
    const [orientation, setOrientation] = useState('')
    const [preview, setPreview] = useState({
        url: null,
        type: null,
        dimensions: null
    })
    const [isDragOver, setIsDragOver] = useState(false)



    // Validate file
    const validateFile = (file) => {
        if (!file) return { isValid: false, error: 'No file selected' }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
            resetForm()
            return { 
                isValid: false, 
                error: `File size too large (${sizeMB}MB). Maximum allowed size is 10MB.` 
            }
        }
        
        // Check file type
        if (!SUPPORTED_TYPES.includes(file.type)) {
            resetForm()
            return { 
                isValid: false, 
                error: 'Unsupported file format. Please upload PNG, JPEG images or MP4 videos only.' 
            }
        }
        
        return { isValid: true }
    }

    // Get file dimensions for images and videos
    const getFileDimensions = (file) => {
        return new Promise((resolve) => {
            if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
                const img = new Image()
                img.onload = () => {
                    resolve(`${img.width} × ${img.height}`)
                }
                img.onerror = () => resolve('Unknown')
                img.src = URL.createObjectURL(file)
            } else if (SUPPORTED_VIDEO_TYPES.includes(file.type)) {
                const video = document.createElement('video')
                video.onloadedmetadata = () => {
                    resolve(`${video.videoWidth} × ${video.videoHeight}`)
                }
                video.onerror = () => resolve('Unknown')
                video.src = URL.createObjectURL(file)
            } else {
                resolve('Unknown')
            }
        })
    }

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Handle file selection
    const handleFileSelect = async (file) => {
        const validation = validateFile(file)
        
        if (!validation.isValid) {
            dispatch(showErrorToast({
                message : validation.error, 
                backGroundColor : Colors.MAGHIL
            }))
            return
        }

        // Get file dimensions
        const dimensions = await getFileDimensions(file)
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        const fileType = SUPPORTED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video'
        
        setSelectedFile(file)
        setPreview({
            url: previewUrl,
            type: fileType,
            dimensions
        })
        
        // Auto-suggest media name from filename
        if (!mediaName) {
            const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
            setMediaName(nameWithoutExtension)
        }
    }

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        
        const files = e.dataTransfer.files
        if (files && files[0]) {
            handleFileSelect(files[0])
        }
    }

    // Handle file input change
    const handleFileInputChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    // Handle upload button click
    const handleUpload = async() => {
        if (!selectedFile) {
            dispatch(showErrorToast({
                message : 'Please select a file to upload', 
                backGroundColor : Colors.MAGHIL
            }))
            return
        }
        
        if (!mediaName.trim()) {
            dispatch(showErrorToast({
                message : 'Please enter a media name', 
                backGroundColor : Colors.MAGHIL
            }))
            return
        }
        
        if (!orientation) {
            dispatch(showErrorToast({
                message : 'Please select an orientation', 
                backGroundColor : Colors.MAGHIL
            }))
            return
        }

        // Prepare upload data
        const uploadData = {
            file: selectedFile,
            mediaName: mediaName.trim(),
            orientation,
            fileInfo: {
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type,
                dimensions: preview.dimensions
            },
            locationId : data?.id
        }

        
        try {
            await dispatch(uploadMediaThunk(uploadData)).unwrap();
            navigate('/dashboard/library'); 
        } catch (error) {
            dispatch(showErrorToast({
                message : error, 
                backGroundColor : Colors.MAGHIL
            }));
            navigate('/dashboard/library'); 
        }
    }

    // Reset form
    const resetForm = () => {
        setSelectedFile(null)
        setMediaName('')
        setOrientation('')
        setPreview({ url: null, type: null, dimensions: null })
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Clean up preview URL on unmount
    React.useEffect(() => {
        return () => {
            if (preview.url) {
                URL.revokeObjectURL(preview.url)
            }
        }
    }, [preview.url])

    return (
        <div className='upload-container'>
            <div className='upload-wrapper'>
                <div className="upload-header">
                    <h1>Upload Media</h1>
                </div>

                <div className="upload-content">
                    <div className="upload-form-section">
                        <h2 className="section-title">Select Media</h2>
                        <div className="form-group">
                            <label className="form-label">Choose Image or Video</label>
                            <div 
                                className={`file-upload-area ${isDragOver ? 'dragover' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="file-input" 
                                    accept="image/png,image/jpeg,video/mp4"
                                    onChange={handleFileInputChange}
                                />
                                <div className="upload-icon">
                                    <img src={fileUpload} alt="Upload" />
                                </div>
                                <div className="upload-text">
                                    {selectedFile ? selectedFile.name : 'Drag & Drop your media here'}
                                </div>
                                <div className="upload-subtext">or click to browse files</div>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Media Name</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Enter media name..."
                                value={mediaName}
                                onChange={(e) => setMediaName(e.target.value)}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Orientation</label>
                            <div className="orientation-group">
                                <div className="radio-option">
                                    <input 
                                        type="radio" 
                                        className="radio-input" 
                                        id="landscape" 
                                        name="orientation" 
                                        value="landscape"
                                        checked={orientation === 'landscape'}
                                        onChange={(e) => setOrientation(e.target.value)}
                                    />
                                    <label className="radio-label" htmlFor="landscape">
                                        Landscape
                                    </label>
                                </div>
                                <div className="radio-option">
                                    <input 
                                        type="radio" 
                                        className="radio-input" 
                                        id="portrait" 
                                        name="orientation" 
                                        value="portrait"
                                        checked={orientation === 'portrait'}
                                        onChange={(e) => setOrientation(e.target.value)}
                                    />
                                    <label className="radio-label" htmlFor="portrait">
                                        Portrait
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="caution-box">
                            <div className="caution-title">
                                ⚠️ Important Guidelines
                            </div>
                            <ul className="caution-list">
                                <li>Maximum file size: <strong>10 MB</strong></li>
                                <li>Supported image formats: <strong>PNG, JPEG</strong></li>
                                <li>Supported video format: <strong>MP4</strong></li>
                                <li>Choose appropriate orientation for your media</li>
                                <li>Provide a descriptive name for easy identification</li>
                            </ul>
                        </div>
                        
                        <div className="button-group">
                            <button 
                                className="upload-button" 
                                onClick={handleUpload}
                                disabled={!selectedFile || !mediaName.trim() || !orientation || uploadMedia.loading}
                            >
                                {
                                    uploadMedia.loading 
                                    ? <Loader size="small" color="dark" variant='dots' className='upload-media-loader'/>
                                    : <p>Upload Media</p>
                                }
                            </button>
                            {selectedFile && (
                                <button 
                                    className="reset-button" 
                                    onClick={resetForm}
                                    type="button"
                                    disabled={uploadMedia.loading}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="preview-section">
                        <h2 className="section-title">Preview</h2>
                        
                        {
                            !selectedFile ? (
                                <div className="preview-placeholder">
                                    <div className="preview-placeholder-icon">
                                        <img src={noImageFound} alt="No preview" />
                                    </div>
                                    <div>Select a file to see preview</div>
                                </div>
                        ) : (
                            <div className="preview-content active">
                                {preview.type === 'image' ? (
                                    <div className="preview-image">
                                        <img 
                                            className="preview-media" 
                                            src={preview.url} 
                                            alt="Preview"
                                            onError={() => {
                                                dispatch(showErrorToast({
                                                    message : 'Failed to load image preview', 
                                                    backGroundColor : Colors.MAGHIL
                                                }))
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="preview-video">
                                        <video 
                                            className="preview-media" 
                                            src={preview.url} 
                                            controls
                                            onError={() => {
                                                dispatch(showErrorToast({
                                                    message : 'Failed to load video preview', 
                                                    backGroundColor : Colors.MAGHIL
                                                }))
                                            }}
                                        >
                                         Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}
                                
                                <div className="preview-info">
                                    <div className="preview-info-item">
                                        <span className="preview-info-label">File Name:</span>
                                        <span className="preview-info-value">{selectedFile.name}</span>
                                    </div>
                                    <div className="preview-info-item">
                                        <span className="preview-info-label">File Size:</span>
                                        <span className={`preview-info-value ${
                                            selectedFile.size > MAX_FILE_SIZE ? 'file-size-warning' : 'file-size-ok'
                                        }`}>
                                            {formatFileSize(selectedFile.size)}
                                        </span>
                                    </div>
                                    <div className="preview-info-item">
                                        <span className="preview-info-label">File Type:</span>
                                        <span className="preview-info-value">{selectedFile.type}</span>
                                    </div>
                                    <div className="preview-info-item">
                                        <span className="preview-info-label">Dimensions:</span>
                                        <span className="preview-info-value">{preview.dimensions || 'Loading...'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadMedia