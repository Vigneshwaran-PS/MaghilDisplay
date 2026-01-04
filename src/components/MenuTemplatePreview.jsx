import React, { useState, useEffect, useRef } from "react";
import "../styles/MenuTemplatePreview.css";
import { GCP_API } from "../api/api";

const MenuTemplatePreview = ({ menuTemplate, sortedMedias, menuData, selectedMenuItems, onClose }) => {
  console.log("menuData", menuData);
  const orientation = menuTemplate?.orientation || "LANDSCAPE";
  const isLandscape = orientation === "LANDSCAPE";

  // Configuration constants - easily changeable
  const CONFIG = {
    LANDSCAPE: {
      columnsPerPage: 3,
      itemsPerColumn: 13,
      itemsPerPage: 39,
      mediaThreshold: 75 // Show media if column has more than 75% height remaining
    },
    PORTRAIT: {
      columnsPerPage: 2,
      itemsPerColumn: 20,
      itemsPerPage: 40,
      mediaThreshold: 75 // Show media if column has more than 75% height remaining
    }
  };

  const config = isLandscape ? CONFIG.LANDSCAPE : CONFIG.PORTRAIT;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  // Get all selected items sequentially (flattened from categories)
  const getAllSelectedItems = () => {
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
  };

  // Calculate heights
  const getCategoryHeaderHeight = () => 50; // Reduced padding
  const getItemHeight = () => 45; // Reduced item height
  const getCategoryPadding = () => 10; // Reduced padding

  const calculateCategoryHeight = (itemCount) => {
    return getCategoryHeaderHeight() + (itemCount * getItemHeight()) + getCategoryPadding();
  };

  const calculateColumnHeight = (items) => {
    if (items.length === 0) return 0;

    let height = 0;
    let currentCategory = null;

    items.forEach(item => {
      if (item.type === 'category') {
        height += calculateCategoryHeight(item.items.length);
        currentCategory = item.category.categoryName;
      } else if (item.type === 'media') {
        // Media takes remaining space
        height += 0; // Will be handled separately
      }
    });

    return height;
  };

  const distributeItemsIntoPages = () => {
    if (!containerRef.current) return [];

    const allItems = getAllSelectedItems();
    const sortedMediasBySequence = sortedMedias
      ? [...sortedMedias].sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0))
      : [];

    // Get available height for content (100vh - header - padding)
    const headerHeight = 80;
    const pagePadding = 20;
    const availableHeight = window.innerHeight - headerHeight - pagePadding;

    const allPages = [];
    let itemIndex = 0;
    let mediaIndex = 0;

    // Group items by category first
    const itemsByCategory = [];
    let currentCategory = null;
    let currentCategoryItems = [];

    allItems.forEach((item, idx) => {
      if (currentCategory !== item.categoryName) {
        if (currentCategory !== null && currentCategoryItems.length > 0) {
          itemsByCategory.push({
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
      itemsByCategory.push({
        categoryId: currentCategoryItems[0].categoryId,
        categoryName: currentCategory,
        items: [...currentCategoryItems]
      });
    }

    // Distribute categories across pages and columns
    let categoryIndex = 0;

    while (categoryIndex < itemsByCategory.length) {
      const pageColumns = Array(config.columnsPerPage).fill(null).map(() => []);
      const columnItemCounts = Array(config.columnsPerPage).fill(0);
      const columnHeights = Array(config.columnsPerPage).fill(0);
      let currentColumn = 0;

      // Fill columns with categories
      while (categoryIndex < itemsByCategory.length &&
        currentColumn < config.columnsPerPage) {

        const category = itemsByCategory[categoryIndex];
        const itemsToAdd = [];
        let itemsAdded = 0;

        // Add items up to the column limit
        for (let i = 0; i < category.items.length && columnItemCounts[currentColumn] < config.itemsPerColumn; i++) {
          itemsToAdd.push(category.items[i]);
          itemsAdded++;
        }

        if (itemsToAdd.length > 0) {
          const categoryHeight = calculateCategoryHeight(itemsToAdd.length);

          // Check if it fits in current column
          if (columnItemCounts[currentColumn] + itemsToAdd.length <= config.itemsPerColumn) {
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
            columnHeights[currentColumn] += categoryHeight;

            // Remove added items from category
            category.items = category.items.slice(itemsAdded);

            // If category is empty, move to next
            if (category.items.length === 0) {
              categoryIndex++;
            }
          } else {
            // Column is full, move to next column
            currentColumn++;
          }
        } else {
          // No items to add, move to next category
          categoryIndex++;
        }

        // If current column is full, move to next
        if (columnItemCounts[currentColumn] >= config.itemsPerColumn) {
          currentColumn++;
        }

        // If all columns are full, break to create new page
        if (currentColumn >= config.columnsPerPage) {
          break;
        }
      }

      // Add media as filler
      pageColumns.forEach((column, colIndex) => {
        const usedHeight = columnHeights[colIndex];
        const usedPercentage = availableHeight > 0 ? (usedHeight / availableHeight) * 100 : 0;
        const remainingPercentage = 100 - usedPercentage;

        // For portrait column 2: if empty or >75% space, add media
        if (!isLandscape && colIndex === 1) {
          if ((columnItemCounts[colIndex] === 0 || remainingPercentage > config.mediaThreshold) &&
            mediaIndex < sortedMediasBySequence.length) {
            column.push({
              type: 'media',
              media: sortedMediasBySequence[mediaIndex],
              sequenceNo: sortedMediasBySequence[mediaIndex].sequenceNo
            });
            mediaIndex++;
          }
        }
        // For landscape: if >75% space remaining, add media
        else if (isLandscape && remainingPercentage > config.mediaThreshold &&
          mediaIndex < sortedMediasBySequence.length) {
          column.push({
            type: 'media',
            media: sortedMediasBySequence[mediaIndex],
            sequenceNo: sortedMediasBySequence[mediaIndex].sequenceNo
          });
          mediaIndex++;
        }
      });

      // Add page if it has content
      if (pageColumns.some(col => col.length > 0)) {
        allPages.push(pageColumns);
      }
    }

    return allPages;
  };

  useEffect(() => {
    const handleResize = () => {
      const pages = distributeItemsIntoPages();
      setSlides(pages);
    };

    const timeoutId = setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuData, selectedMenuItems, orientation, sortedMedias, menuTemplate]);

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
          <div className="preview-header-overlay preview-header-fixed">
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
                          borderBottom: `2px solid ${menuTemplate?.categoryTextColor || '#333'}`
                        }}
                      >
                        <h2>{content.category.categoryName}</h2>
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
