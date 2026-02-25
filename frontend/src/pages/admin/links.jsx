import { useState, useEffect } from 'react';
import { footerLinksService } from '../../services/footerLinks';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, ExternalLink, GripVertical, Facebook, Instagram, Twitter, Mail, Phone, MapPin, X, Youtube, MessageCircle } from 'lucide-react';
import { FaTiktok } from "react-icons/fa";
import { useToast } from '../../components/Toast';

function getIconComponent(iconName) {
  switch (iconName) {
    case "facebook": return Facebook;
    case "instagram": return Instagram;
    case "twitter": return Twitter;
    case "youtube": return Youtube;
    case "whatsapp": return MessageCircle;
    case "Mappin": return MapPin;
    case "mail": return Mail;
    case "phone": return Phone;
    case "location": return MapPin;
    case "tiktok": return FaTiktok;
    default: return ExternalLink;
  }
}

export default function Links() {
  const toast = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    type: 'menu',
    icon: 'external',
    active: true,
    category: '',
    platform: '',
    phoneNumber: '',
    hoverText: '',
    order: 0,
  });

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await footerLinksService.getAll();
      setLinks(res.data.links || []);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Filter links based on selected type
  const getFilteredLinks = () => {
    if (!Array.isArray(links)) return [];
    if (selectedType === 'all') return links;
    if (selectedType === 'floating') return links.filter(link => link.type === 'floating');
    if (selectedType === 'footer') {
      return links.filter(link => link.type === 'footer');
    }
    return links.filter(link => link.type === selectedType);
  };

  // Group links by type for display
  const groupLinksByType = (linksArray) => {
    return linksArray.reduce((acc, link) => {
      const type = link.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(link);
      return acc;
    }, {});
  };

  const filteredLinks = getFilteredLinks();
  const groupedLinks = selectedType === 'all' ? groupLinksByType(filteredLinks) : { [selectedType]: filteredLinks };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'footer': return 'Footer Links';
      case 'menu': return 'Menu Links';
      case 'social': return 'Social Media';
      case 'promotion': return 'Promotional Links';
      case 'floating': return 'Floating Social Icons';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'footer': return 'bg-[#592a0d] text-white';
      case 'menu': return 'bg-[#bfa77b] text-[#592a0d]';
      case 'social': return 'bg-[#d4a574] text-[#592a0d]';
      case 'promotion': return 'bg-[#8b6f47] text-white';
      case 'floating': return 'bg-green-600 text-white';
      default: return 'bg-gray-200';
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleAddLink = () => {
    setIsAddDialogOpen(true);
    setSelectedLink(null);
    setFormData({
      label: '',
      url: '',
      type: 'menu',
      icon: 'external',
      active: true,
      category: '',
      platform: '',
      phoneNumber: '',
      hoverText: '',
      order: 0,
    });
  };

  const handleEditLink = (link) => {
    setSelectedLink(link);
    setFormData({
      label: link.label || '',
      url: link.url || '',
      type: link.type || 'menu',
      icon: link.icon || 'external',
      active: link.active !== false,
      category: link.category || '',
      platform: link.platform || '',
      phoneNumber: link.phoneNumber || '',
      hoverText: link.hoverText || '',
      order: link.order || 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveLink = async () => {
    // Validation
    if (formData.type === 'floating') {
      if (!formData.platform) {
        toast.error('Validation Error', 'Please select a social platform');
        return;
      }
      if (formData.platform === 'whatsapp') {
        if (!formData.phoneNumber?.trim()) {
          toast.error('Validation Error', 'Please enter WhatsApp phone number');
          return;
        }
      } else {
        if (!formData.url?.trim()) {
          toast.error('Validation Error', 'Please enter the social media URL');
          return;
        }
      }
    } else {
      if (!formData.label?.trim()) {
        toast.error('Validation Error', 'Please enter link label');
        return;
      }
      if (!formData.url?.trim()) {
        toast.error('Validation Error', 'Please enter link URL');
        return;
      }
      if (formData.type === 'footer' && !formData.category) {
        toast.error('Validation Error', 'Please select a footer link category');
        return;
      }
    }

    try {
      const dataToSave = { ...formData };
      
      // For floating icons, set label based on platform
      if (formData.type === 'floating') {
        const platformLabels = {
          facebook: 'Facebook',
          instagram: 'Instagram',
          youtube: 'YouTube',
          whatsapp: 'WhatsApp',
          twitter: 'Twitter (X)'
        };
        dataToSave.label = platformLabels[formData.platform] || formData.platform;
        dataToSave.icon = formData.platform;
        if (formData.platform === 'whatsapp') {
          dataToSave.url = formData.phoneNumber; // Store phone in url for consistency
        }
      }

      if (selectedLink) {
        await footerLinksService.update(selectedLink._id, dataToSave);
        toast.success('Success', 'Link updated successfully');
      } else {
        await footerLinksService.create(dataToSave);
        toast.success('Success', 'Link created successfully');
      }
      
      await fetchLinks();
      setIsAddDialogOpen(false);
      setSelectedLink(null);
    } catch (err) {
      toast.error('Error', 'Failed to save link');
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await footerLinksService.delete(id);
        await fetchLinks();
        toast.success('Success', 'Link deleted successfully');
      } catch (err) {
        toast.error('Error', 'Failed to delete link');
      }
    }
  };

  const getPlatformLabel = (platform) => {
    const labels = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      youtube: 'YouTube',
      whatsapp: 'WhatsApp',
      twitter: 'Twitter (X)',
      tiktok: 'TikTok'
    };
    return labels[platform] || platform;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-2xl sm:text-3xl font-bold">
            Links Management
          </h2>
          <button
            onClick={handleAddLink}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#592a0d] text-white rounded-lg hover:bg-[#6d3a18] transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg">
          <div className="p-4 sm:p-6 flex flex-wrap gap-2">
            {['all', 'menu', 'footer', 'social', 'promotion', 'floating'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors border text-xs sm:text-sm ${
                  selectedType === type 
                    ? 'bg-[#592a0d] text-white border-[#592a0d]' 
                    : 'border-[#bfa77b] text-[#592a0d] hover:bg-[#bfa77b]/10'
                }`}
              >
                {type === 'all' ? 'All Links' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Links Display */}
        {loading ? (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : (
          Object.entries(groupedLinks).map(([type, linksGroup]) => {
            if (!linksGroup || linksGroup.length === 0) return null;
            
            return (
              <div key={type} className="bg-white border border-[#e8dfd3] rounded-lg mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-[#e8dfd3]">
                  <span style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-lg sm:text-xl font-semibold">
                    {getTypeLabel(type)}
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold w-fit ${getTypeBadgeColor(type)}`}>
                    {linksGroup.length} {linksGroup.length === 1 ? 'link' : 'links'}
                  </span>
                </div>
                <div className="p-3 sm:p-4 space-y-2">
                  {linksGroup.map((link) => {
                    const IconComponent = getIconComponent(link.icon || link.platform);
                    return (
                      <div key={link._id} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border border-[#e8dfd3] hover:bg-[#faf8f5] transition-colors group">
                        <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-move hidden sm:block flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-[#bfa77b] flex-shrink-0" />
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <p className="font-medium text-sm sm:text-base truncate">{link.label}</p>
                              <div className="text-xs sm:text-sm text-gray-500 overflow-hidden">
                                <span className="block truncate sm:hidden">
                                  {/* Mobile: Show truncated text */}
                                  {link.type === 'floating' && link.platform === 'whatsapp' 
                                    ? `Phone: ${link.phoneNumber || link.url}` 
                                    : (link.url?.length > 30 ? `${link.url.substring(0, 30)}...` : link.url)}
                                </span>
                                <span className="hidden sm:block truncate">
                                  {/* Desktop: Show full text with truncation */}
                                  {link.type === 'floating' && link.platform === 'whatsapp' 
                                    ? `Phone: ${link.phoneNumber || link.url}` 
                                    : link.url}
                                </span>
                              </div>
                              {link.type === 'floating' && link.hoverText && (
                                <p className="text-xs text-gray-400 truncate">Hover: {link.hoverText}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                            <span className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              link.active ? 'bg-[#8b6f47] text-white' : 'bg-gray-400 text-white'
                            }`}>
                              {link.active ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex gap-1 sm:gap-2">
                              <button 
                                onClick={() => handleEditLink(link)} 
                                className="p-2 text-[#592a0d] hover:bg-[#bfa77b]/10 rounded-lg transition-colors"
                                title="Edit Link"
                              >
                                <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteLink(link._id)} 
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete Link"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Empty State */}
        {!loading && filteredLinks.length === 0 && (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 text-center">
            <p className="text-gray-500">No links found. Click "Add Link" to create one.</p>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-[#faf8f5] rounded-lg border border-[#e8dfd3] p-4">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Use "Floating Social Icon" type to add social media icons that appear fixed at the bottom-right corner of all frontend pages. Only active floating icons will be visible to users.
          </p>
        </div>

        {/* Add/Edit Link Modal */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg border border-[#e8dfd3] w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-[#e8dfd3] flex items-center justify-between">
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-lg sm:text-2xl font-bold">
                    {selectedLink ? 'Edit Link' : 'Add New Link'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {selectedLink ? 'Update link details' : 'Create a new link for your website'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedLink(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Link Type */}
                <div>
                  <label className="block text-sm font-medium text-[#592a0d] mb-2">Link Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d] text-sm sm:text-base"
                  >
                    <option value="menu">Menu</option>
                    <option value="footer">Footer</option>
                    <option value="social">Social Media</option>
                    <option value="promotion">Promotion</option>
                    <option value="floating">Floating Social Icon</option>
                  </select>
                </div>

                {/* Floating Social Icon Fields */}
                {formData.type === 'floating' ? (
                  <>
                    {/* Platform Selection */}
                    <div>
                      <label className="block text-sm font-medium text-[#592a0d] mb-2">Social Platform</label>
                      <select
                        name="platform"
                        value={formData.platform}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                      >
                        <option value="">Select Platform</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="twitter">Twitter (X)</option>
                        <option value="tiktok">TikTok</option>
                      </select>
                    </div>

                    {/* URL or Phone Number based on platform */}
                    {formData.platform === 'whatsapp' ? (
                      <div>
                        <label className="block text-sm font-medium text-[#592a0d] mb-2">Phone Number</label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleFormChange}
                          placeholder="e.g., 923001234567 (no + or spaces)"
                          className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter phone number in international format without + or spaces</p>
                      </div>
                    ) : formData.platform && (
                      <div>
                        <label className="block text-sm font-medium text-[#592a0d] mb-2">Profile/Page URL</label>
                        <input
                          type="text"
                          name="url"
                          value={formData.url}
                          onChange={handleFormChange}
                          placeholder={`https://${formData.platform}.com/yourpage`}
                          className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                        />
                      </div>
                    )}

                    {/* Hover Text */}
                    {formData.platform && (
                      <div>
                        <label className="block text-sm font-medium text-[#592a0d] mb-2">Hover Text (Optional)</label>
                        <input
                          type="text"
                          name="hoverText"
                          value={formData.hoverText}
                          onChange={handleFormChange}
                          placeholder={formData.platform === 'whatsapp' 
                            ? 'e.g., Chat with us on WhatsApp' 
                            : `e.g., Follow us on ${getPlatformLabel(formData.platform)}`}
                          className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.platform === 'whatsapp' 
                            ? 'Phone number will also be shown on hover' 
                            : 'Text shown when user hovers over the icon'}
                        </p>
                      </div>
                    )}

                    {/* Display Order */}
                    <div>
                      <label className="block text-sm font-medium text-[#592a0d] mb-2">Display Order</label>
                      <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleFormChange}
                        min="0"
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (top)</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Regular Link Fields */}
                    <div>
                      <label className="block text-sm font-medium text-[#592a0d] mb-2">Link Label</label>
                      <input
                        type="text"
                        name="label"
                        value={formData.label}
                        onChange={handleFormChange}
                        placeholder="e.g., About Us, Facebook"
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#592a0d] mb-2">URL</label>
                      <input
                        type="text"
                        name="url"
                        value={formData.url}
                        onChange={handleFormChange}
                        placeholder="e.g., /about, https://..."
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#592a0d] mb-2">Icon</label>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                      >
                        <option value="external">External Link</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter</option>
                        <option value="mail">Email</option>
                        <option value="tiktok">TikTok</option>
                        <option value="phone">Contact Number</option>
                        <option value="location">Location</option>
                        <option value="Mappin">Map</option>
                      </select>
                    </div>

                    {/* Footer Link Category */}
                    {formData.type === 'footer' && (
                      <div>
                        <label className="block text-sm font-medium text-[#592a0d] mb-2">Footer Link Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent bg-white text-[#592a0d]"
                        >
                          <option value="">Select Category</option>
                          <option value="quick">Quick Links</option>
                          <option value="social">Social Links</option>
                          <option value="contact">Contact Us</option>
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    id="linkActive"
                    checked={formData.active}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded border-[#e8dfd3] text-[#592a0d] focus:ring-[#bfa77b] cursor-pointer"
                  />
                  <label htmlFor="linkActive" className="text-sm font-medium text-[#592a0d] cursor-pointer">
                    Active {formData.type === 'floating' && '(Only active icons appear on frontend)'}
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveLink}
                    className="flex-1 px-4 py-2 bg-[#592a0d] text-white rounded-md hover:bg-[#6d3a18] transition-colors font-medium"
                  >
                    {selectedLink ? 'Update Link' : 'Add Link'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setSelectedLink(null);
                    }}
                    className="flex-1 px-4 py-2 border border-[#bfa77b] text-[#592a0d] rounded-md hover:bg-[#bfa77b]/10 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
