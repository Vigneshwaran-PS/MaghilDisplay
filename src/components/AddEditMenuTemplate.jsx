import React, { useEffect, useRef, useState } from "react";
import "../styles/AddEditMenuTemplate.css";
import { mediaLibraryThunk } from "../thunks/MediaLibraryThunk";
import { useDispatch, useSelector } from "react-redux";
import { showErrorToast } from "../slices/ErrorToastSlice";
import * as Colors from "../constants/Colors";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import noMediaFound from "../assets/icons/NoImageFound.png";
import Loader from "../components/Loader";
import { GCP_API } from "../api/api";
import { SketchPicker } from "react-color";
import { menuThunk, saveMenuTemplateThunk } from '../thunks/MenuThunk';
import MenuTemplatePreview from './MenuTemplatePreview';

const AddEditMenuTemplate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const locationDetials = useSelector((state) => state?.slug?.data);
  const menu = useSelector(state => state?.menu);

  const [menuTemplate, setMenuTemplate] = useState(
    routerLocation.state?.menuTemplate || {
      displayName: '',
      orientation: 'LANDSCAPE',
      menuRefreshTimeInMins: '',
      backgroundColor: '#ffffff',
      categoryCardBackgroundColor: '#f5f5f5',
      categoryTextColor: '#333333',
      itemCardBackgroundColor: '#ffffff',
      itemCardTextColor: '#333333',
      itemPriceTextColor: '#e74c3c'
    }
  );

  const [orderTypeDetails, setOrderTypeDetails] = useState({});
  const [currentOrientation, setCurrentOrientation] = useState("PORTRAIT");
  const [mediasLoading, setMediasLoading] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState(
    routerLocation.state?.selectedMediaIds || new Set()
  );
  const [chooseImage, setChooseImage] = useState(false);
  const [sortedMedias, setSortedMedias] = useState(
    routerLocation.state?.sortedMedias || []
  );
  const [videoDurations, setVideoDurations] = useState({});
  const { medias } = useSelector((state) => state?.mediaLibrary);
  const videoRefs = useRef({});
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState({
    backgroundColor: false,
    categoryCardBackgroundColor: false,
    categoryTextColor: false,
    itemCardBackgroundColor: false,
    itemCardTextColor: false,
    itemPriceTextColor: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMenuItems, setSelectedMenuItems] = useState(
    routerLocation.state?.selectedMenuItems
      ? new Set(routerLocation.state.selectedMenuItems)
      : new Set()
  );
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let currentLocationDetails = locationDetials?.branch?.filter(
      (branch) => branch?.id === locationDetials?.id
    );
    let dineInOrderType = currentLocationDetails?.[0]?.orderTypes?.filter(
      (orderType) => orderType?.typeGroup == "D"
    );
    setOrderTypeDetails(dineInOrderType?.[0] || null);
  }, [locationDetials]);

  useEffect(() => {
    if (locationDetials?.id && orderTypeDetails?.id) {
      dispatch(menuThunk({
        locationId: locationDetials?.id,
        orderTypeId: orderTypeDetails?.id
      }));
    }
  }, [orderTypeDetails]);

  const handleDisplayNameChange = (e) => {
    setMenuTemplate({
      ...menuTemplate,
      displayName: e.target.value,
    });
  };

  const handleOrientationChange = (e) => {
    const newOrientation = e.target.value;

    setSelectedMediaIds(new Set());
    setSortedMedias([]);
    setMenuTemplate((prev) => ({
      ...prev,
      orientation: newOrientation,
      spotLightMedia: []
    }));
  };

  const loadMediaByLocationAndOrientation = async () => {
    try {
      setMediasLoading(true);
      setChooseImage(true);

      const targetLocationId = locationDetials?.id;
      const targetOrientation = "PORTRAIT";

      setCurrentOrientation(targetOrientation);

      if (targetOrientation && targetLocationId) {
        const response = await dispatch(
          mediaLibraryThunk({
            locationId: targetLocationId,
            orientation: targetOrientation,
          })
        ).unwrap();

        if (!response || response.error) {
          dispatch(
            showErrorToast({
              message: "Something went wrong, please try again later.",
              backGroundColor: Colors.MAGHIL,
            })
          );
          return;
        }
      } else {
        dispatch(
          showErrorToast({
            message: "Location information is required to load media.",
            backGroundColor: Colors.MAGHIL,
          })
        );
        setChooseImage(false);
      }
    } catch (error) {
      dispatch(
        showErrorToast({
          message: "Something went wrong, please try again later.",
          backGroundColor: Colors.MAGHIL,
        })
      );
      setChooseImage(false);
      console.log("Exception occured while loading media ", error);
    } finally {
      setMediasLoading(false);
    }
  };

  const updateChooseImageState = () => {
    setChooseImage(!chooseImage);
  };

  const isMediaSelected = (media) => {
    return selectedMediaIds.has(media?.mediaId);
  };

  const getOrientation = () => {
    return "portrait";
  };

  const getMediaUrl = (media) => {
    if (!media) {
      return "";
    }
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

  const getMediaName = (displayName) => {
    return displayName?.length >= 40
      ? displayName.slice(0, 40).concat("...")
      : displayName;
  };

  const handleMediaSelect = (media, isChecked) => {
    const newSelectedIds = new Set(selectedMediaIds);

    if (isChecked) {
      if (sortedMedias.length >= 3) {
        dispatch(
          showErrorToast({
            message: "Maximum 3 media items can be selected.",
            backGroundColor: Colors.MAGHIL,
          })
        );
        return;
      }

      newSelectedIds.add(media.mediaId);

      const mediaExists = sortedMedias.find((m) => m.mediaId === media.mediaId);
      if (!mediaExists) {
        let mimeType;
        if (media?.mediaType?.toLowerCase() === "image") {
          mimeType = media?.mimeType || "image/jpeg";
        } else {
          mimeType = media?.mimeType || "video/mp4";
        }

        const newMedia = {
          ...media,
          sequenceNo: sortedMedias.length + 1,
          mimeType: mimeType,
        };

        const updatedSortedMedias = [...sortedMedias, newMedia];
        setSortedMedias(updatedSortedMedias);

        setMenuTemplate((prev) => ({
          ...prev,
          spotLightMedia: updatedSortedMedias,
        }));
      }
    } else {
      newSelectedIds.delete(media.mediaId);
      const updatedSortedMedias = sortedMedias.filter(
        (m) => m.mediaId !== media.mediaId
      );

      const resequencedMedias = updatedSortedMedias.map((m, index) => ({
        ...m,
        sequenceNo: index + 1,
      }));

      setSortedMedias(resequencedMedias);

      setMenuTemplate((prev) => ({
        ...prev,
        spotLightMedia: resequencedMedias,
      }));
    }

    setSelectedMediaIds(newSelectedIds);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleVideoLoadedMetadata = (mediaId, duration) => {
    setVideoDurations(prev => ({
      ...prev,
      [mediaId]: Math.round(duration)
    }));
  };

  const handleMenuRefreshTimeChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setMenuTemplate({
        ...menuTemplate,
        menuRefreshTimeInMins: "",
      });
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const numValue = parseInt(value, 10);

    if (numValue >= 5 && numValue <= 60) {
      setMenuTemplate({
        ...menuTemplate,
        menuRefreshTimeInMins: value,
      });
    } else if (numValue < 5) {
      setMenuTemplate({
        ...menuTemplate,
        menuRefreshTimeInMins: value,
      });
    }
  };

  const handleColorChange = (colorField, color) => {
    setMenuTemplate((prev) => ({
      ...prev,
      [colorField]: color.hex,
    }));
  };

  const toggleColorPicker = (colorField) => {
    const newState = Object.keys(showColorPicker).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    setShowColorPicker({
      ...newState,
      [colorField]: true,
    });
  };

  const closeColorPicker = (colorField) => {
    setShowColorPicker((prev) => ({
      ...prev,
      [colorField]: false,
    }));
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newMedias = [...sortedMedias];
    const draggedItem = newMedias[draggedIndex];

    newMedias.splice(draggedIndex, 1);
    newMedias.splice(dropIndex, 0, draggedItem);

    const updatedMedias = newMedias.map((media, index) => ({
      ...media,
      sequenceNo: index + 1,
    }));

    setSortedMedias(updatedMedias);
    setDraggedIndex(null);

    setMenuTemplate((prev) => ({
      ...prev,
      spotLightMedia: updatedMedias,
    }));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (category, isChecked) => {
    const newSelected = new Set(selectedMenuItems);

    category.items.forEach(item => {
      if (item.enabled && item.active) {
        if (isChecked) {
          newSelected.add(item.itemId);
        } else {
          newSelected.delete(item.itemId);
        }
      }
    });

    setSelectedMenuItems(newSelected);
  };

  const handleItemSelect = (itemId, isChecked) => {
    const newSelected = new Set(selectedMenuItems);

    if (isChecked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }

    setSelectedMenuItems(newSelected);
  };

  const isCategoryFullySelected = (category) => {
    const enabledItems = category.items.filter(item => item.enabled && item.active);
    return enabledItems.length > 0 && enabledItems.every(item => selectedMenuItems.has(item.itemId));
  };

  const isCategoryPartiallySelected = (category) => {
    const enabledItems = category.items.filter(item => item.enabled && item.active);
    return enabledItems.some(item => selectedMenuItems.has(item.itemId)) && !isCategoryFullySelected(category);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      dispatch(
        showErrorToast({
          message: "Please complete all required fields: Display Name, All Colors, and at least 10 menu items",
          backGroundColor: Colors.MAGHIL,
        })
      );
      return;
    }
  
    setIsSaving(true);
  
    try {
      const payload = {
        locationId: locationDetials?.id || "",
        templateType: "MENU",
        orientation: menuTemplate.orientation,
        displayName: menuTemplate?.displayName,
        spotLightMedia: sortedMedias.map(media => ({
          sequenceNo: media.sequenceNo,
          mediaId: media.mediaId,
          name: media.name,
          mimeType: media.mimeType || (media.mediaType?.toLowerCase() === 'video' ? 'video/mp4' : 'image/jpeg'),
          displayTime: videoDurations[media.mediaId] || 10,
        })),
        menuTemplate: {
          menuRefreshTimeInMins: menuTemplate.menuRefreshTimeInMins || "",
          items: Array.from(selectedMenuItems), 
          backGroundColor: menuTemplate.backgroundColor,
          categoryCardBackgroundColor: menuTemplate.categoryCardBackgroundColor,
          categoryTextColor: menuTemplate.categoryTextColor,
          itemCardBackgroundColor: menuTemplate.itemCardBackgroundColor,
          itemCardTextColor: menuTemplate.itemCardTextColor,
          itemPriceTextColor: menuTemplate.itemPriceTextColor
        }
      };
  
      const response = await dispatch(saveMenuTemplateThunk(payload)).unwrap();
      const isSuccess = response?.httpStatus === 200
  
      if (isSuccess) {
        dispatch(
          showErrorToast({
            message: response.message || "Menu template saved successfully!",
            backGroundColor: Colors.SUCCESS_GREEN,
          })
        );
        
        const route = "/dashboard/modules/menu"
        navigate(`${route}/${routerLocation?.state?.locationId}/${routerLocation?.state?.templateId}`);    
        return;
      }
  
      dispatch(
        showErrorToast({
          message: response.message || "Failed to save menu template. Please try again.",
          backGroundColor: Colors.MAGHIL,
        })
      );
  
    } catch (error) {
      let errorMessage = "Something went wrong, please try again later.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                       error.response.data?.error || 
                       `Error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      dispatch(
        showErrorToast({
          message: errorMessage,
          backGroundColor: Colors.MAGHIL,
        })
      );
      console.error("Error saving menu template:", error);
      
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    const hasName = menuTemplate.displayName?.trim().length > 0;
    const hasAllColors = menuTemplate.backgroundColor &&
      menuTemplate.categoryCardBackgroundColor &&
      menuTemplate.categoryTextColor &&
      menuTemplate.itemCardBackgroundColor &&
      menuTemplate.itemCardTextColor &&
      menuTemplate.itemPriceTextColor;
    const hasMinMenuItems = selectedMenuItems.size >= 10;

    return hasName && hasAllColors && hasMinMenuItems;
  };

  return (
    <div className="menu-template-container">
      <div className="menu-template-wrapper">
        <div className="menu-template-header">
          <h2> New Menu Template </h2>
        </div>

        <div className="menu-template-config-wrapper">
          <div className="menu-template-configuration">
            <div className="menu-template-config-header">
              Display Configuration
            </div>
            <div className="menu-template-config-name">
              <h4> Display Name: </h4>
              <input
                type="text"
                value={menuTemplate?.displayName || ""}
                name="displayName"
                onChange={handleDisplayNameChange}
                placeholder="Enter display name (Max 60 characters)"
                maxLength={60}
              />
            </div>
            <div className="menu-template-config-type">
              <h4> Orientation: </h4>
              <select
                name="orientation"
                value={menuTemplate?.orientation || "LANDSCAPE"}
                onChange={handleOrientationChange}
              >
                <option value="LANDSCAPE"> LANDSCAPE </option>
                <option value="PORTRAIT"> PORTRAIT </option>
              </select>
            </div>
            <div className="menu-template-config-refresh-time">
              <h4> Menu Refresh Time: </h4>
              <input
                type="text"
                value={menuTemplate?.menuRefreshTimeInMins || ""}
                name="menuRefreshTimeInMins"
                onChange={handleMenuRefreshTimeChange}
                placeholder="Enter menu refresh time (Min 5mins, Max 60mins)"
                maxLength={60}
              />
            </div>
          </div>

          <div className="menu-template-color-configuration">
            <div className="menu-template-color-config-header">
              Color Configuration
            </div>
            {[
              { key: 'backgroundColor', label: 'Background Color' },
              { key: 'categoryCardBackgroundColor', label: 'Category Card Background' },
              { key: 'categoryTextColor', label: 'Category Text Color' },
              { key: 'itemCardBackgroundColor', label: 'Item Card Background' },
              { key: 'itemCardTextColor', label: 'Item Text Color' },
              { key: 'itemPriceTextColor', label: 'Item Price Color' }
            ].map(({ key, label }) => (
              <div className="menu-template-config-color" key={key}>
                <h4> {label}: </h4>
                <div className="color-picker-wrapper">
                  <div
                    className="color-preview"
                    style={{
                      backgroundColor: menuTemplate?.[key] || '#ffffff',
                    }}
                    onClick={() => toggleColorPicker(key)}
                  >
                    <span>
                      {menuTemplate?.[key] || '#ffffff'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(showColorPicker).map(
          (colorField) =>
            showColorPicker[colorField] && (
              <div
                key={colorField}
                className="color-picker-overlay"
                onClick={() => closeColorPicker(colorField)}
              >
                <div
                  className="color-picker-popover"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="color-picker-close"
                    onClick={() => closeColorPicker(colorField)}
                  >
                    ×
                  </button>
                  <SketchPicker
                    color={menuTemplate?.[colorField] || "#ffffff"}
                    onChange={(color) => handleColorChange(colorField, color)}
                  />
                </div>
              </div>
            )
        )}

        <div className="menu-template-medias">
          <div
            className="menu-template-add-media"
            onClick={() => loadMediaByLocationAndOrientation()}
          >
            +
          </div>
          <div className="menu-template-medias-header">Media's ({sortedMedias.length}/3)</div>
          <div className="menu-template-media-container">
            {sortedMedias.length === 0 ? (
              <div className="menu-template-no-media-found">
                <div>
                  <img src={noMediaFound} alt="" />
                  <p> No Media Found </p>
                </div>
              </div>
            ) : (
              <div className={`menu-template-media-wrapper ${getOrientation()}`}>
                {sortedMedias?.map((media, index) => {
                  const mediaType =
                    media?.mimeType?.split("/")?.[0] ||
                    media?.mediaType?.toLowerCase();
                  const isVideo = mediaType === "video";

                  return (
                    <div
                      className={`menu-template-each-media ${getOrientation()} ${draggedIndex === index ? "dragging" : ""
                        }`}
                      key={media?.mediaId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{
                        cursor: "move",
                      }}
                    >
                      <div className="drag-handle">
                        <span> ⋮⋮ </span>
                      </div>
                      <picture>
                        {mediaType === "image" ? (
                          <img src={getMediaUrl(media)} alt="" />
                        ) : (
                          <video
                            ref={(el) =>
                              (videoRefs.current[media.mediaId] = el)
                            }
                            src={getMediaUrl(media)}
                            controls
                            muted
                            onLoadedMetadata={(e) =>
                              handleVideoLoadedMetadata(
                                media.mediaId,
                                e.target.duration
                              )
                            }
                          />
                        )}
                      </picture>
                      <div
                        className={`menu-template-media-content ${getOrientation()}`}
                      >
                        <div className="menu-template-media-info-row">
                          <h3>Name:</h3>
                          <p>{getMediaName(media?.name)}</p>
                        </div>
                        <div className="menu-template-media-info-row">
                          <h3>Sequence:</h3>
                          <p>{index + 1}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="menu-template-menu-selection">
          <div className="menu-template-menu-header">
            Menu Selection ({selectedMenuItems.size} items selected)
          </div>
          {menu?.loading ? (
            <div className="menu-template-menu-loader">
              <Loader variant="spinner" size="large" />
            </div>
          ) : menu?.data?.categories && menu.data.categories.length > 0 ? (
            <div className="menu-categories-container">
              {menu.data.categories.map((category) => (
                <div key={category.categoryId} className="menu-category-item">
                  <div className="menu-category-header">
                    <div className="menu-category-checkbox">
                      <input
                        type="checkbox"
                        checked={isCategoryFullySelected(category)}
                        ref={(el) => {
                          if (el) el.indeterminate = isCategoryPartiallySelected(category);
                        }}
                        onChange={(e) => handleCategorySelect(category, e.target.checked)}
                      />
                    </div>
                    <div
                      className="menu-category-title"
                      onClick={() => toggleCategory(category.categoryId)}
                    >
                      <span className="menu-category-icon">
                        {expandedCategories.has(category.categoryId) ? '▼' : '▶'}
                      </span>
                      <h3>{category.categoryName}</h3>
                      <span className="menu-category-count">
                        ({category.items.filter(item => item.enabled && item.active).length} items)
                      </span>
                    </div>
                  </div>

                  {expandedCategories.has(category.categoryId) && (
                    <div className="menu-items-list">
                      {category.items
                        .filter(item => item.enabled && item.active)
                        .map((item) => (
                          <div key={item.itemId} className="menu-item">
                            <input
                              type="checkbox"
                              checked={selectedMenuItems.has(item.itemId)}
                              onChange={(e) => handleItemSelect(item.itemId, e.target.checked)}
                            />
                            <span className="menu-item-name">{item.itemName}</span>
                            <span className="menu-item-price">${item.itemPrice}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="menu-template-no-menu-found">
              <p>No menu data available</p>
            </div>
          )}
        </div>

        <div className="menu-template-actions">
          <button
            type="button"
            className="menu-template-cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="menu-template-preview-btn"
            onClick={handlePreview}
            disabled={!isFormValid()}
          >
            Preview
          </button>
          <button
            type="button"
            className="menu-template-save-btn"
            onClick={handleSave}
            disabled={!isFormValid() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {chooseImage && (
        <div className="choose-media-overlay-container">
          <div
            className="close-media-overlay-container"
            onClick={() => updateChooseImageState()}
          >
            &times;
          </div>
          {mediasLoading ? (
            <div className="menu-template-media-loader">
              <Loader variant="spinner" size="large" />
            </div>
          ) : (
            <div className="close-media-overlay-wrapper">
              <div className="close-media-overlay-header">
                <h1> Media's</h1>
              </div>

              <div
                className={`menu-template-medias-container ${getOrientation()}`}
              >
                <div
                  className={`menu-template-medias-wrapper ${getOrientation()}`}
                >
                  {medias?.libraryMedia?.length > 0 ? (
                    medias?.libraryMedia?.map((media) => {
                      const isSelected = isMediaSelected(media);
                      return (
                        <div
                          className={`menu-template-single-media ${getOrientation()} ${isSelected ? "selected" : ""
                            }`}
                          key={media?.mediaId}
                        >
                          <div className="is-media-selected">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleMediaSelect(media, e.target.checked)
                              }
                            />
                          </div>
                          <picture
                            className={`menu-template-single-media-picture ${getOrientation()}`}
                          >
                            {media?.mediaType?.toLowerCase() === "image" ? (
                              <img
                                src={getMediaUrl(media)}
                                alt=""
                                className={`menu-template-single-media-img ${getOrientation()}`}
                              />
                            ) : (
                              <video
                                className={`menu-template-single-media-video ${getOrientation()}`}
                                ref={(el) =>
                                  (videoRefs.current[media.mediaId] = el)
                                }
                                src={getMediaUrl(media)}
                                controls
                                muted
                              />
                            )}
                          </picture>
                          <div
                            className={`menu-template-single-media-content ${getOrientation()}`}
                          >
                            <div className="menu-template-single-media-name">
                              <div> Name </div> <span>: </span>
                              <div> {getMediaName(media?.name)} </div>
                            </div>
                            <div className="menu-template-single-media-size">
                              <div> Size </div> <span>: </span>
                              <div> {media?.mediaSize} </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="menu-template-no-media-found">
                      <div>
                        <img src={noMediaFound} alt="" />
                        <p>
                          No Media Found for {getOrientation()} orientation
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showPreview && (
        <MenuTemplatePreview
          menuTemplate={menuTemplate}
          sortedMedias={sortedMedias}
          menuData={menu?.data}
          selectedMenuItems={Array.from(selectedMenuItems)}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
};

export default AddEditMenuTemplate;