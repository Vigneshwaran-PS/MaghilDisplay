import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "../styles/MenuTemplatePreview.css";
import { GCP_API } from "../api/api";

const MenuTemplatePreview = ({ menuTemplate, sortedMedias, menuData, selectedMenuItems, onClose }) => {
  console.log("menuData", menuData);
  const orientation = menuTemplate?.orientation || "LANDSCAPE";
  const isLandscape = orientation === "LANDSCAPE";

  // Fixed configuration - no dynamic calculations
  const CONFIG = useMemo(() => ({
    LANDSCAPE: {
      columnsPerPage: 3,
      itemsPerColumn: 13,
      itemHeight: 45, // Fixed height for each item
      categoryHeaderHeight: 50,
      itemSpacing: 5
    },
    PORTRAIT: {
      columnsPerPage: 2,
      itemsPerColumn: 20,
      itemHeight: 30, // Fixed height for each item
      categoryHeaderHeight: 35,
      itemSpacing: 1
    }
  }), []);

  const config = isLandscape ? CONFIG.LANDSCAPE : CONFIG.PORTRAIT;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  // Get all selected items
  const getAllSelectedItems = useMemo(() => {
    const allItems = [];

    menuData?.categories?.forEach(category => {
      category.items.forEach(item => {
        if (selectedMenuItems?.includes(item.itemId) && item.enabled && item.active) {
          allItems.push({
            ...item,
            categoryId: category.categoryId,
            categoryName: category.categoryName
          });
        }
      });
    });

    return allItems;
  }, [menuData, selectedMenuItems]);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const itemsByCat = [];
    let currentCategory = null;
    let currentCategoryItems = [];

    getAllSelectedItems.forEach((item) => {
      if (currentCategory !== item.categoryName) {
        if (currentCategory !== null && currentCategoryItems.length > 0) {
          itemsByCat.push({
            categoryId: currentCategoryItems[0].categoryId,
            categoryName: currentCategory,
            items: [...currentCategoryItems]
          });
        }
        currentCategory = item.categoryName;
        currentCategoryItems = [item];
      } else {
        currentCategoryItems.push(item);
      }
    });

    // Add last category
    if (currentCategory !== null && currentCategoryItems.length > 0) {
      itemsByCat.push({
        categoryId: currentCategoryItems[0].categoryId,
        categoryName: currentCategory,
        items: [...currentCategoryItems]
      });
    }

    return itemsByCat;
  }, [getAllSelectedItems]);

  // Simple distribution algorithm
  const distributeItemsIntoPages = useCallback(() => {
    if (itemsByCategory.length === 0) return [];
    
    console.log("Distributing items:", itemsByCategory.length, "categories");
    console.log("Config:", config);

    const allPages = [];
    let categoryIndex = 0;
    let mediaIndex = 0;

    // Sort medias once
    const sortedMediasBySequence = sortedMedias
      ? [...sortedMedias].sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0))
      : [];

    while (categoryIndex < itemsByCategory.length) {
      const pageColumns = Array(config.columnsPerPage).fill(null).map(() => []);
      const columnItemCounts = Array(config.columnsPerPage).fill(0);
      let currentColumn = 0;

      // Fill columns with categories
      while (categoryIndex < itemsByCategory.length && currentColumn < config.columnsPerPage) {
        const category = { ...itemsByCategory[categoryIndex] }; // Copy to avoid mutation issues
        
        // Calculate how many items we can add
        const remainingInColumn = config.itemsPerColumn - columnItemCounts[currentColumn];
        const itemsToTake = Math.min(remainingInColumn, category.items.length);
        
        if (itemsToTake > 0) {
          const itemsToAdd = category.items.slice(0, itemsToTake);
          
          pageColumns[currentColumn].push({
            type: 'category',
            category: {
              categoryId: category.categoryId,
              categoryName: category.categoryName,
              items: itemsToAdd
            },
            items: itemsToAdd
          });

          columnItemCounts[currentColumn] += itemsToAdd.length;

          // Update the category items (this is okay since we're working with a copy)
          category.items = category.items.slice(itemsToTake);
          
          // If this category still has items, update the original array
          if (category.items.length > 0) {
            itemsByCategory[categoryIndex] = category;
          } else {
            // Category is empty, move to next
            categoryIndex++;
          }
        } else {
          // No items to add, move to next category
          categoryIndex++;
        }

        // If current column is full, move to next
        if (columnItemCounts[currentColumn] >= config.itemsPerColumn) {
          currentColumn++;
        }
      }

      // Add media as filler in the last column if there's space
      const lastColumnIndex = config.columnsPerPage - 1;
      if (columnItemCounts[lastColumnIndex] < config.itemsPerColumn && 
          mediaIndex < sortedMediasBySequence.length) {
        pageColumns[lastColumnIndex].push({
          type: 'media',
          media: sortedMediasBySequence[mediaIndex],
          sequenceNo: sortedMediasBySequence[mediaIndex].sequenceNo
        });
        mediaIndex++;
      }

      // Add page if it has content
      if (pageColumns.some(col => col.length > 0)) {
        allPages.push(pageColumns);
        console.log(`Created page ${allPages.length} with columns:`, pageColumns.map(col => col.length));
      }
    }

    console.log("Total pages created:", allPages.length);
    return allPages;
  }, [config, itemsByCategory, sortedMedias]);

  // Update slides
  useEffect(() => {
    console.log("Updating slides...");
    
    if (itemsByCategory.length === 0) {
      console.log("No items to display");
      setSlides([]);
      return;
    }

    // Simple timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      const pages = distributeItemsIntoPages();
      console.log("Slides generated:", pages.length);
      setSlides(pages);
    }, 50);

    return () => clearTimeout(timer);
  }, [distributeItemsIntoPages, itemsByCategory.length]);

  const getMediaUrl = useCallback((media) => {
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
  }, []);

  // Show loading only briefly
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (showLoading || slides.length === 0) {
    return (
      <div className="preview-overlay">
        <div
          className="preview-container-overlay"
          ref={containerRef}
          style={{ background: menuTemplate?.backgroundColor || '#ffffff' }}
        >
          <div className="preview-header-overlay preview-header-fixed">
            <h1 className="preview-title">{menuTemplate?.displayName || 'Menu Preview'}</h1>
            <button onClick={onClose} className="preview-back-btn">✕ Close Preview</button>
          </div>
          <div className="preview-loading">
            {itemsByCategory.length > 0 ? "Generating preview..." : "No items selected"}
          </div>
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
        <div className="preview-header-overlay preview-header-fixed">
          <h1 className="preview-title">
            {menuTemplate?.displayName || 'Menu Preview'}
          </h1>
          <div className="preview-header-actions">
            {slides.length > 1 && (
              <div className="preview-pagination">
                <span>Page {currentSlide + 1} of {slides.length}</span>
              </div>
            )}
            <button onClick={onClose} className="preview-back-btn">
              ✕ Close Preview
            </button>
          </div>
        </div>

        <div
          ref={gridRef}
          className={`preview-grid ${isLandscape ? 'landscape' : 'portrait'}`}
        >
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
                          borderBottom: `2px solid ${menuTemplate?.categoryTextColor || '#333'}`,
                          height: `${config.categoryHeaderHeight}px`,
                          padding: '0 10px'
                        }}
                      >
                        <h2>{content.category.categoryName}</h2>
                      </div>

                      <div
                        className="preview-category-items"
                        style={{
                          background: menuTemplate?.categoryCardBackgroundColor || '#f5f5f5',
                          padding: '8px 10px'
                        }}
                      >
                        {content.items.map(item => (
                          <div
                            key={item.itemId}
                            className="preview-menu-item"
                            style={{
                              background: menuTemplate?.itemCardBackgroundColor || '#ffffff',
                              borderLeft: `3px solid ${menuTemplate?.itemPriceTextColor || '#e74c3c'}`,
                              height: `${config.itemHeight}px`,
                              marginBottom: `${config.itemSpacing}px`
                            }}
                          >
                            <div className="preview-item-content">
                              <div
                                className="preview-item-name"
                                style={{
                                  color: menuTemplate?.itemCardTextColor || '#333',
                                  fontSize: '14px'
                                }}
                              >
                                {item.itemName}
                              </div>
                              <div
                                className="preview-item-price"
                                style={{
                                  color: menuTemplate?.itemPriceTextColor || '#e74c3c',
                                  fontSize: '15px',
                                  fontWeight: 'bold'
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
                    <div
                      key={`media-${colIndex}-${contentIndex}-seq-${content.sequenceNo}`}
                      className="preview-media-container preview-media-filler"
                    >
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