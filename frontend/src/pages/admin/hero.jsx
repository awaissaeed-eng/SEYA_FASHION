import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { heroService } from '../../services/hero';
import { useToast } from '../../components/Toast';
import { getImageUrl, getVideoUrl } from '../../utils/imageUrl';
import { 
  Image, Video, Upload, Trash2, Eye, 
  Play, VolumeX, RotateCcw, Save, RefreshCw,
  Clock, Sparkles, AlignLeft, AlignCenter, AlignRight, 
  Type, MoveHorizontal
} from 'lucide-react';

export default function HeroSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [settings, setSettings] = useState({
    mediaType: 'image',
    images: [],
    video: '',
    blurEnabled: false,
    blurAmount: 4,
    slideshowEnabled: true,
    slideshowInterval: 5,
    videoAutoplay: true,
    videoLoop: true,
    videoMuted: true,
    title: 'Elegance Redefined',
    subtitle: 'NEW COLLECTION 2025',
    description: 'Discover our exclusive collection of luxury women\'s clothing.',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop',
    contentPosition: 'left',
    contentVerticalPosition: 'middle',
    titleSize: 'large',
    subtitleSize: 'small',
    descriptionSize: 'medium',
    buttonSize: 'medium',
    showSubtitle: true,
    showDescription: true,
    showButton: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await heroService.getSettings();
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      toast.error('Error', 'Failed to load hero settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await heroService.updateSettings(settings);
      if (res.data.success) {
        toast.success('Saved', 'Hero settings updated successfully');
      }
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const res = await heroService.uploadImages(files);
      if (res.data.success) {
        setSettings(prev => ({ ...prev, images: res.data.images }));
        toast.success('Uploaded', `${files.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await heroService.uploadVideo(file);
      if (res.data.success) {
        setSettings(prev => ({ ...prev, video: res.data.video }));
        toast.success('Uploaded', 'Video uploaded successfully');
      }
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await heroService.deleteImage(imageUrl);
      if (res.data.success) {
        setSettings(prev => ({ ...prev, images: res.data.images }));
        toast.success('Deleted', 'Image deleted successfully');
      }
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await heroService.deleteVideo();
      if (res.data.success) {
        setSettings(prev => ({ ...prev, video: '' }));
        toast.success('Deleted', 'Video deleted successfully');
      }
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to delete video');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#592a0d]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-2xl sm:text-3xl font-bold">
              Hero Section Settings
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your homepage hero section</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={fetchSettings}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-[#bfa77b] text-[#592a0d] rounded-lg hover:bg-[#bfa77b]/10 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#592a0d] text-white rounded-lg hover:bg-[#6d3a18] transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Media Settings */}
          <div className="space-y-4 sm:space-y-6">
            {/* Media Type Selection */}
            <div className="bg-white rounded-lg border border-[#e8dfd3] p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-[#592a0d] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#bfa77b]" />
                Media Type
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  settings.mediaType === 'image' 
                    ? 'border-[#592a0d] bg-[#592a0d]/5' 
                    : 'border-[#e8dfd3] hover:border-[#bfa77b]'
                }`}>
                  <input
                    type="radio"
                    name="mediaType"
                    value="image"
                    checked={settings.mediaType === 'image'}
                    onChange={(e) => setSettings(prev => ({ ...prev, mediaType: e.target.value }))}
                    className="sr-only"
                  />
                  <Image className="w-5 h-5 sm:w-6 sm:h-6 text-[#592a0d]" />
                  <span className="font-medium text-[#592a0d] text-sm sm:text-base">Image Slideshow</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  settings.mediaType === 'video' 
                    ? 'border-[#592a0d] bg-[#592a0d]/5' 
                    : 'border-[#e8dfd3] hover:border-[#bfa77b]'
                }`}>
                  <input
                    type="radio"
                    name="mediaType"
                    value="video"
                    checked={settings.mediaType === 'video'}
                    onChange={(e) => setSettings(prev => ({ ...prev, mediaType: e.target.value }))}
                    className="sr-only"
                  />
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 text-[#592a0d]" />
                  <span className="font-medium text-[#592a0d] text-sm sm:text-base">Video</span>
                </label>
              </div>
            </div>

            {/* Blur Effect */}
            <div className="bg-white rounded-lg border border-[#e8dfd3] p-6">
              <h3 className="text-lg font-semibold text-[#592a0d] mb-4">Blur Effect</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-[#592a0d]">Enable Blur</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, blurEnabled: !prev.blurEnabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.blurEnabled ? 'bg-[#592a0d]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                      settings.blurEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </label>
                {settings.blurEnabled && (
                  <div>
                    <label className="text-sm text-gray-600">Blur Amount: {settings.blurAmount}px</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={settings.blurAmount}
                      onChange={(e) => setSettings(prev => ({ ...prev, blurAmount: parseInt(e.target.value) }))}
                      className="w-full mt-2"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Image Settings */}
            {settings.mediaType === 'image' && (
              <div className="bg-white rounded-lg border border-[#e8dfd3] p-6">
                <h3 className="text-lg font-semibold text-[#592a0d] mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#bfa77b]" />
                  Images & Slideshow
                </h3>
                
                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#bfa77b] rounded-lg cursor-pointer hover:bg-[#faf8f5] transition-colors mb-4">
                  <Upload className="w-5 h-5 text-[#592a0d]" />
                  <span className="text-[#592a0d] font-medium">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>

                {/* Images Grid */}
                {settings.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {settings.images.map((img, index) => (
                      <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-[#e8dfd3]">
                        <img
                          src={getImageUrl(img)}
                          alt={`Hero ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteImage(img)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Slideshow Settings */}
                <div className="space-y-4 pt-4 border-t border-[#e8dfd3]">
                  <label className="flex items-center justify-between">
                    <span className="text-[#592a0d]">Enable Slideshow</span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, slideshowEnabled: !prev.slideshowEnabled }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.slideshowEnabled ? 'bg-[#592a0d]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                        settings.slideshowEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                  {settings.slideshowEnabled && (
                    <div>
                      <label className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Interval: {settings.slideshowInterval} seconds
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={settings.slideshowInterval}
                        onChange={(e) => setSettings(prev => ({ ...prev, slideshowInterval: parseInt(e.target.value) }))}
                        className="w-full mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video Settings */}
            {settings.mediaType === 'video' && (
              <div className="bg-white rounded-lg border border-[#e8dfd3] p-6">
                <h3 className="text-lg font-semibold text-[#592a0d] mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#bfa77b]" />
                  Video Settings
                </h3>
                
                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#bfa77b] rounded-lg cursor-pointer hover:bg-[#faf8f5] transition-colors mb-4">
                  <Upload className="w-5 h-5 text-[#592a0d]" />
                  <span className="text-[#592a0d] font-medium">
                    {uploading ? 'Uploading...' : 'Upload Video'}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>

                {/* Video Preview */}
                {settings.video && (
                  <div className="relative mb-4 rounded-lg overflow-hidden border border-[#e8dfd3]">
                    <video
                      src={getVideoUrl(settings.video)}
                      className="w-full aspect-video object-cover"
                      controls
                    />
                    <button
                      onClick={handleDeleteVideo}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Video Controls */}
                <div className="space-y-4 pt-4 border-t border-[#e8dfd3]">
                  <label className="flex items-center justify-between">
                    <span className="text-[#592a0d] flex items-center gap-2">
                      <Play className="w-4 h-4" /> Autoplay
                    </span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, videoAutoplay: !prev.videoAutoplay }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.videoAutoplay ? 'bg-[#592a0d]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                        settings.videoAutoplay ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[#592a0d] flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" /> Loop
                    </span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, videoLoop: !prev.videoLoop }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.videoLoop ? 'bg-[#592a0d]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                        settings.videoLoop ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[#592a0d] flex items-center gap-2">
                      <VolumeX className="w-4 h-4" /> Muted
                    </span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, videoMuted: !prev.videoMuted }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.videoMuted ? 'bg-[#592a0d]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                        settings.videoMuted ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Content Settings */}
          <div className="space-y-6">
            {/* Hero Content */}
            <div className="bg-white rounded-lg border border-[#e8dfd3] p-6">
              <h3 className="text-lg font-semibold text-[#592a0d] mb-4">Hero Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={settings.subtitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                    placeholder="NEW COLLECTION 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                    placeholder="Elegance Redefined"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-1">Description</label>
                  <textarea
                    value={settings.description}
                    onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                    placeholder="Discover our exclusive collection..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Button Text</label>
                    <input
                      type="text"
                      value={settings.buttonText}
                      onChange={(e) => setSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                      placeholder="SHOP NOW"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Button Link</label>
                    <input
                      type="text"
                      value={settings.buttonLink}
                      onChange={(e) => setSettings(prev => ({ ...prev, buttonLink: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b]"
                      placeholder="/shop"
                    />
                  </div>
                </div>

                {/* Show/Hide Elements */}
                <div className="pt-4 border-t border-[#e8dfd3] space-y-3">
                  <p className="text-sm font-medium text-[#592a0d]">Show/Hide Elements</p>
                  <label className="flex items-center justify-between">
                    <span className="text-[#592a0d] text-sm">Show Subtitle</span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showSubtitle: !prev.showSubtitle }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.showSubtitle ? 'bg-[#592a0d]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                        settings.showSubtitle ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[#592a0d] text-sm">Show Description</span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showDescription: !prev.showDescription }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.showDescription ? 'bg-[#592a0d]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                        settings.showDescription ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[#592a0d] text-sm">Show Button</span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showButton: !prev.showButton }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.showButton ? 'bg-[#592a0d]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                        settings.showButton ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                </div>
              </div>
            </div>

            {/* Content Layout */}
            <div className="bg-white rounded-lg border border-[#e8dfd3] p-6">
              <h3 className="text-lg font-semibold text-[#592a0d] mb-4 flex items-center gap-2">
                <MoveHorizontal className="w-5 h-5 text-[#bfa77b]" />
                Content Layout
              </h3>
              <div className="space-y-4">
                {/* Horizontal Position */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Horizontal Position</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'left', icon: AlignLeft, label: 'Left' },
                      { value: 'center', icon: AlignCenter, label: 'Center' },
                      { value: 'right', icon: AlignRight, label: 'Right' },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setSettings(prev => ({ ...prev, contentPosition: value }))}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          settings.contentPosition === value
                            ? 'border-[#592a0d] bg-[#592a0d]/5'
                            : 'border-[#e8dfd3] hover:border-[#bfa77b]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#592a0d]" />
                        <span className="text-sm text-[#592a0d]">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Position */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Vertical Position</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'top', label: 'Top' },
                      { value: 'middle', label: 'Middle' },
                      { value: 'bottom', label: 'Bottom' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setSettings(prev => ({ ...prev, contentVerticalPosition: value }))}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          settings.contentVerticalPosition === value
                            ? 'border-[#592a0d] bg-[#592a0d]/5'
                            : 'border-[#e8dfd3] hover:border-[#bfa77b]'
                        }`}
                      >
                        <span className="text-sm text-[#592a0d]">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Sizes */}
                <div className="pt-4 border-t border-[#e8dfd3]">
                  <p className="text-sm font-medium text-[#592a0d] mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4" /> Text Sizes
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Title Size</label>
                      <select
                        value={settings.titleSize}
                        onChange={(e) => setSettings(prev => ({ ...prev, titleSize: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b] text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="xlarge">Extra Large</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Subtitle Size</label>
                      <select
                        value={settings.subtitleSize}
                        onChange={(e) => setSettings(prev => ({ ...prev, subtitleSize: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b] text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Description Size</label>
                      <select
                        value={settings.descriptionSize}
                        onChange={(e) => setSettings(prev => ({ ...prev, descriptionSize: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b] text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Button Size</label>
                      <select
                        value={settings.buttonSize}
                        onChange={(e) => setSettings(prev => ({ ...prev, buttonSize: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa77b] text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg border border-[#e8dfd3] p-6">
              <h3 className="text-lg font-semibold text-[#592a0d] mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#bfa77b]" />
                Preview
              </h3>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-[#592a0d] to-[#3b1d0a]">
                {/* Background Media */}
                {settings.mediaType === 'image' && settings.images.length > 0 && (
                  <img
                    src={getImageUrl(settings.images[0])}
                    alt="Preview"
                    className={`absolute inset-0 w-full h-full object-cover ${
                      settings.blurEnabled ? `blur-[${settings.blurAmount}px]` : ''
                    }`}
                    style={settings.blurEnabled ? { filter: `blur(${settings.blurAmount}px)` } : {}}
                  />
                )}
                {settings.mediaType === 'video' && settings.video && (
                  <video
                    src={getVideoUrl(settings.video)}
                    className={`absolute inset-0 w-full h-full object-cover`}
                    style={settings.blurEnabled ? { filter: `blur(${settings.blurAmount}px)` } : {}}
                    autoPlay
                    muted
                    loop
                  />
                )}
                
                {/* Content Overlay */}
                <div className={`absolute inset-0 flex p-4 ${
                  settings.contentVerticalPosition === 'top' ? 'items-start pt-6' :
                  settings.contentVerticalPosition === 'bottom' ? 'items-end pb-6' : 'items-center'
                } ${
                  settings.contentPosition === 'center' ? 'justify-center' :
                  settings.contentPosition === 'right' ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`${settings.contentPosition === 'center' ? 'text-center' : ''}`}>
                    {settings.showSubtitle && (
                      <p className={`text-[#bfa77b] tracking-widest mb-1 ${
                        settings.subtitleSize === 'large' ? 'text-sm' :
                        settings.subtitleSize === 'medium' ? 'text-xs' : 'text-[10px]'
                      }`}>{settings.subtitle}</p>
                    )}
                    <h2 className={`text-[#bfa77b] font-serif font-bold mb-2 ${
                      settings.titleSize === 'xlarge' ? 'text-2xl' :
                      settings.titleSize === 'large' ? 'text-xl' :
                      settings.titleSize === 'medium' ? 'text-lg' : 'text-base'
                    }`}>{settings.title}</h2>
                    {settings.showDescription && (
                      <p className={`text-[#e7dcc8] mb-3 max-w-xs line-clamp-2 ${
                        settings.contentPosition === 'center' ? 'mx-auto' : ''
                      } ${
                        settings.descriptionSize === 'large' ? 'text-sm' :
                        settings.descriptionSize === 'medium' ? 'text-xs' : 'text-[10px]'
                      }`}>{settings.description}</p>
                    )}
                    {settings.showButton && (
                      <button className={`bg-[#bfa77b] text-[#592a0d] rounded-full font-semibold ${
                        settings.contentPosition === 'center' ? 'mx-auto' : ''
                      } ${
                        settings.buttonSize === 'large' ? 'px-5 py-2 text-sm' :
                        settings.buttonSize === 'medium' ? 'px-4 py-1.5 text-xs' : 'px-3 py-1 text-[10px]'
                      }`}>
                        {settings.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
