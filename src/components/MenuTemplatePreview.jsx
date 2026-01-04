import React, { useState, useEffect, useRef } from "react";
import "../styles/MenuTemplatePreview.css";
import { GCP_API } from "../api/api";

const MenuTemplatePreview = ({ menuTemplate, sortedMedias, menuData, selectedMenuItems, onClose }) => {
  const orientation = menuTemplate?.orientation || "LANDSCAPE";
  const isLandscape = orientation === "LANDSCAPE";
  const columnsPerSlide = isLandscape ? 3 : 2;
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const containerRef = useRef(null);

  const getItemsByCategory = () => {
    const categoriesWithItems = [];
    
    menuData?.categories?.forEach(category => {
      const categoryItems = category.items.filter(item => 
        selectedMenuItems?.includes(item.itemId) && item.enabled && item.active
      );
      
      if (categoryItems.length > 0) {
        categoriesWithItems.push({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          items: categoryItems
        });
      }
    });
    
    return categoriesWithItems;
  };

  const categoriesWithItems = getItemsByCategory();

  const columnHasSpaceForMedia = (columnHeight, maxHeight) => {
    const usedPercentage = (columnHeight / maxHeight) * 100;
    return usedPercentage < 50;
  };

  const estimateCategoryHeight = (itemCount) => {
    const headerHeight = 70;
    const itemHeight = 40;
    const padding = 30;
    return headerHeight + (itemCount * itemHeight) + padding;
  };

  const distributeContent = () => {
    if (!containerRef.current) return [];
    
    const maxColumnHeight = containerRef.current.clientHeight - 150;
    const allSlides = [];
    let currentSlideColumns = Array(columnsPerSlide).fill(null).map(() => []);
    let currentSlideHeights = Array(columnsPerSlide).fill(0);
    let categoryIndex = 0;
    let currentColumnIndex = 0;

    const categoriesCopy = JSON.parse(JSON.stringify(categoriesWithItems));

    while (categoryIndex < categoriesCopy.length) {
      const category = categoriesCopy[categoryIndex];
      const categoryHeight = estimateCategoryHeight(category.items.length);
      
      if (currentSlideHeights[currentColumnIndex] + categoryHeight <= maxColumnHeight) {
        currentSlideColumns[currentColumnIndex].push({
          type: 'category',
          category: category,
          items: category.items
        });
        currentSlideHeights[currentColumnIndex] += categoryHeight;
        categoryIndex++;
      } else {
        const availableHeight = maxColumnHeight - currentSlideHeights[currentColumnIndex];
        const headerHeight = 80;
        const itemHeight = 50;
        const padding = 50;
        
        const itemsThatFit = Math.floor((availableHeight - headerHeight - padding) / itemHeight);
        
        if (itemsThatFit > 0 && currentSlideHeights[currentColumnIndex] > 0) {
          const itemsForThisColumn = category.items.slice(0, itemsThatFit);
          const remainingItems = category.items.slice(itemsThatFit);
          
          currentSlideColumns[currentColumnIndex].push({
            type: 'category',
            category: { ...category, items: itemsForThisColumn },
            items: itemsForThisColumn,
            isSplit: true
          });
          
          currentSlideHeights[currentColumnIndex] = maxColumnHeight;
          
          categoriesCopy[categoryIndex] = {
            ...category,
            items: remainingItems
          };
        }
        
        currentColumnIndex++;
        
        if (currentColumnIndex >= columnsPerSlide) {
          allSlides.push([...currentSlideColumns]);
          currentSlideColumns = Array(columnsPerSlide).fill(null).map(() => []);
          currentSlideHeights = Array(columnsPerSlide).fill(0);
          currentColumnIndex = 0;
        }
      }
    }

    if (currentSlideColumns.some(col => col.length > 0)) {
      allSlides.push(currentSlideColumns);
    }

    if (sortedMedias && sortedMedias.length > 0) {
      const sortedMediasBySequence = [...sortedMedias].sort((a, b) => a.sequenceNo - b.sequenceNo);
      let mediaIndex = 0;
      
      allSlides.forEach((slide) => {
        slide.forEach((column, colIndex) => {
          const columnHeight = column.reduce((sum, item) => {
            if (item.type === 'category') {
              return sum + estimateCategoryHeight(item.items.length);
            }
            return sum;
          }, 0);
          
          if (columnHasSpaceForMedia(columnHeight, maxColumnHeight) && mediaIndex < sortedMediasBySequence.length) {
            column.push({
              type: 'media',
              media: sortedMediasBySequence[mediaIndex],
              sequenceNo: sortedMediasBySequence[mediaIndex].sequenceNo
            });
            mediaIndex++;
          }
        });
      });
    }

    return allSlides;
  };

  useEffect(() => {
    const handleResize = () => {
      const distributed = distributeContent();
      setSlides(distributed);
    };

    setTimeout(handleResize, 100);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [menuData, selectedMenuItems, orientation, sortedMedias]);

  const getMediaUrl = (media) => {
    if (!media) return "";
    const mediaId = media?.mediaId;
    let fileExtension;
    
    if (media?.mimeType) {
      fileExtension = media.mimeType.split("/")[1];
    } else if (media?.mediaType) {
      fileExtension = media.mediaType.toLowerCase() === "image" ? "jpg" : "mp4";
    } else {
      fileExtension = "jpg";
    }

    return `${GCP_API.defaults.baseURL}/${mediaId}.${fileExtension}`;
  };

  if (!slides.length) {
    return (
      <div className="preview-overlay">
        <div 
          className="preview-container-overlay" 
          ref={containerRef} 
          style={{ background: menuTemplate?.backgroundColor || '#ffffff' }}
        >
          <div className="preview-header-overlay">
            <h1 className="preview-title">{menuTemplate?.displayName || 'Menu Preview'}</h1>
            <button onClick={onClose} className="preview-back-btn">✕ Close Preview</button>
          </div>
          <div className="preview-loading">Loading preview...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-overlay">
      <div 
        className="preview-container-overlay"
        ref={containerRef}
        style={{
          background: menuTemplate?.backgroundColor || '#ffffff'
        }}
      >
        <div className="preview-header-overlay">
          <h1 className="preview-title">
            {menuTemplate?.displayName || 'Menu Preview'}
          </h1>
          <div className="preview-header-actions">
            {slides.length > 1 && (
              <div className="preview-pagination">
                <span>Slide {currentSlide + 1} of {slides.length}</span>
              </div>
            )}
            <button onClick={onClose} className="preview-back-btn">
              ✕ Close Preview
            </button>
          </div>
        </div>

        <div className={`preview-grid ${isLandscape ? 'landscape' : 'portrait'}`}>
          {slides[currentSlide]?.map((columnContent, colIndex) => (
            <div
              key={colIndex}
              className="preview-column"
            >
              {columnContent.map((content, contentIndex) => {
                if (content.type === 'category') {
                  return (
                    <div 
                      key={`${content.category.categoryId}-${contentIndex}`}
                      className="preview-category-card"
                      style={{
                        background: menuTemplate?.categoryCardBackgroundColor || '#f5f5f5',
                        border: `2px solid ${menuTemplate?.categoryTextColor || '#333'}`
                      }}
                    >
                      <div 
                        className="preview-category-header"
                        style={{
                          color: menuTemplate?.categoryTextColor || '#333',
                          background: menuTemplate?.categoryCardBackgroundColor || '#f5f5f5',
                          borderBottom: `2px solid ${menuTemplate?.categoryTextColor || '#333'}`
                        }}
                      >
                        <h2>{content.category.categoryName}</h2>
                        {content.isSplit && <span className="split-indicator">(continued...)</span>}
                      </div>
                      
                      <div 
                        className="preview-category-items"
                        style={{
                          background: menuTemplate?.categoryCardBackgroundColor || '#f5f5f5'
                        }}
                      >
                        {content.items.map(item => (
                          <div
                            key={item.itemId}
                            className="preview-menu-item"
                            style={{
                              background: menuTemplate?.itemCardBackgroundColor || '#ffffff',
                              borderLeft: `4px solid ${menuTemplate?.itemPriceTextColor || '#e74c3c'}`
                            }}
                          >
                            <div className="preview-item-content">
                              <div 
                                className="preview-item-name"
                                style={{
                                  color: menuTemplate?.itemCardTextColor || '#333'
                                }}
                              >
                                {item.itemName}
                              </div>
                              <div 
                                className="preview-item-price"
                                style={{
                                  color: menuTemplate?.itemPriceTextColor || '#e74c3c'
                                }}
                              >
                                ${item.itemPrice}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else if (content.type === 'media') {
                  const isVideo = content.media.mediaType?.toLowerCase() === 'video' || 
                                 content.media.mimeType?.startsWith('video/');
                  
                  return (
                    <div key={`media-${colIndex}-${contentIndex}-seq-${content.sequenceNo}`} className="preview-media-container">
                      <div className="preview-media-content">
                        {isVideo ? (
                          <video
                            src={getMediaUrl(content.media)}
                            controls
                            muted
                            autoPlay
                            loop
                            className="preview-media-video"
                          />
                        ) : (
                          <img 
                            src={getMediaUrl(content.media)}
                            alt={content.media.name}
                            className="preview-media-image"
                          />
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="preview-slide-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`slide-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                style={{
                  background: index === currentSlide 
                    ? menuTemplate?.itemPriceTextColor || '#e74c3c'
                    : 'rgba(0, 0, 0, 0.2)'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuTemplatePreview;