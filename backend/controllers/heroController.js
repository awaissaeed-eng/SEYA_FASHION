const HeroSettings = require('../models/heroSettings');
const { uploadToCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');

// Get hero settings (public)
exports.getHeroSettings = async (req, res) => {
  try {
    const settings = await HeroSettings.getSettings();
    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update hero settings (admin)
exports.updateHeroSettings = async (req, res) => {
  try {
    const {
      mediaType,
      blurEnabled,
      blurAmount,
      slideshowEnabled,
      slideshowInterval,
      videoAutoplay,
      videoLoop,
      videoMuted,
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      contentPosition,
      contentVerticalPosition,
      titleSize,
      subtitleSize,
      descriptionSize,
      buttonSize,
      showSubtitle,
      showDescription,
      showButton,
    } = req.body;

    let settings = await HeroSettings.getSettings();

    if (mediaType !== undefined) settings.mediaType = mediaType;
    if (blurEnabled !== undefined) settings.blurEnabled = blurEnabled;
    if (blurAmount !== undefined) settings.blurAmount = blurAmount;
    if (slideshowEnabled !== undefined) settings.slideshowEnabled = slideshowEnabled;
    if (slideshowInterval !== undefined) settings.slideshowInterval = slideshowInterval;
    if (videoAutoplay !== undefined) settings.videoAutoplay = videoAutoplay;
    if (videoLoop !== undefined) settings.videoLoop = videoLoop;
    if (videoMuted !== undefined) settings.videoMuted = videoMuted;
    if (title !== undefined) settings.title = title;
    if (subtitle !== undefined) settings.subtitle = subtitle;
    if (description !== undefined) settings.description = description;
    if (buttonText !== undefined) settings.buttonText = buttonText;
    if (buttonLink !== undefined) settings.buttonLink = buttonLink;
    if (contentPosition !== undefined) settings.contentPosition = contentPosition;
    if (contentVerticalPosition !== undefined) settings.contentVerticalPosition = contentVerticalPosition;
    if (titleSize !== undefined) settings.titleSize = titleSize;
    if (subtitleSize !== undefined) settings.subtitleSize = subtitleSize;
    if (descriptionSize !== undefined) settings.descriptionSize = descriptionSize;
    if (buttonSize !== undefined) settings.buttonSize = buttonSize;
    if (showSubtitle !== undefined) settings.showSubtitle = showSubtitle;
    if (showDescription !== undefined) settings.showDescription = showDescription;
    if (showButton !== undefined) settings.showButton = showButton;

    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Hero settings updated successfully',
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload hero images (admin)
exports.uploadHeroImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const settings = await HeroSettings.getSettings();
    
    // Upload images to Cloudinary
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, {
        folder: 'seya-fashion/hero',
        resource_type: 'image',
      })
    );
    const uploadResults = await Promise.all(uploadPromises);
    const newImages = uploadResults.map(result => result.url);
    
    settings.images = [...settings.images, ...newImages];
    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: settings.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload hero video (admin)
exports.uploadHeroVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video uploaded' });
    }

    const settings = await HeroSettings.getSettings();
    
    // Delete old video from Cloudinary if exists
    if (settings.video) {
      const oldPublicId = getPublicIdFromUrl(settings.video);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId, 'video');
      }
    }
    
    // Upload new video to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'seya-fashion/hero',
      resource_type: 'video',
    });
    
    settings.video = result.url;
    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      video: settings.video,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete hero image (admin)
exports.deleteHeroImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const settings = await HeroSettings.getSettings();
    
    // Remove from array
    settings.images = settings.images.filter(img => img !== imageUrl);
    settings.updatedAt = Date.now();
    await settings.save();

    // Delete from Cloudinary
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, 'image');
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      images: settings.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete hero video (admin)
exports.deleteHeroVideo = async (req, res) => {
  try {
    const settings = await HeroSettings.getSettings();
    
    // Delete from Cloudinary
    if (settings.video) {
      const publicId = getPublicIdFromUrl(settings.video);
      if (publicId) {
        await deleteFromCloudinary(publicId, 'video');
      }
    }
    
    settings.video = '';
    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reorder hero images (admin)
exports.reorderHeroImages = async (req, res) => {
  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Images array is required' });
    }

    const settings = await HeroSettings.getSettings();
    settings.images = images;
    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Images reordered successfully',
      images: settings.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
