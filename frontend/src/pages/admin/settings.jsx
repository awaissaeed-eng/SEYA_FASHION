import { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Shield, Save, Camera, DollarSign, Truck, Package, AlertTriangle, Power } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../config/api';
import { getImageUrl } from '../../utils/imageUrl';

export default function Settings() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: null,
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Tax and Shipping Settings
  const [taxSettings, setTaxSettings] = useState({
    gstPercentage: 0,
    isEnabled: false,
    shippingCharges: {
      isEnabled: false,
      fixedAmount: 0,
      freeShippingAbove: 0,
    },
  });
  const [savingTax, setSavingTax] = useState(false);

  // Maintenance Mode Settings
  const [maintenanceSettings, setMaintenanceSettings] = useState({
    enabled: false,
    message: '',
    endTime: '',
  });
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchTaxSettings();
    fetchMaintenanceSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || null,
      });
      if (user.avatar) {
        setAvatarPreview(getImageUrl(user.avatar));
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxSettings = async () => {
    try {
      const response = await api.get('/tax/settings');
      const settings = response.data.gstSettings || response.data.taxSettings;
      setTaxSettings({
        gstPercentage: settings.gstPercentage || 0,
        isEnabled: settings.isEnabled || false,
        shippingCharges: settings.shippingCharges || {
          isEnabled: false,
          fixedAmount: 0,
          freeShippingAbove: 0,
        },
      });
    } catch (error) {
      console.error('Failed to load tax settings:', error);
    }
  };

  const fetchMaintenanceSettings = async () => {
    try {
      const response = await api.get('/maintenance/settings');
      const settings = response.data.data;
      setMaintenanceSettings({
        enabled: settings.enabled || false,
        message: settings.message || '',
        endTime: settings.endTime || '',
      });
    } catch (error) {
      console.error('Failed to load maintenance settings:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswords(prev => ({ ...prev, [id]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const formData = new FormData();
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await api.put('/users/admin/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setAvatarFile(null);
        if (response.data.user.avatar) {
          setAvatarPreview(getImageUrl(response.data.user.avatar));
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      setMessage({ type: 'error', text: 'Please fill in both password fields' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setChangingPassword(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/users/admin/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswords({ currentPassword: '', newPassword: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTaxSettingsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTaxSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setTaxSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleUpdateTaxSettings = async () => {
    setSavingTax(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/tax/settings', taxSettings);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Tax and shipping settings updated successfully!' });
        // Refresh settings from server
        await fetchTaxSettings();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update settings' });
    } finally {
      setSavingTax(false);
    }
  };

  const handleMaintenanceChange = (field, value) => {
    setMaintenanceSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleMaintenance = async () => {
    const newEnabled = !maintenanceSettings.enabled;

    // Show warning before enabling
    if (newEnabled) {
      const confirmed = window.confirm(
        '⚠️ WARNING: Enabling maintenance mode will make the website inaccessible to all visitors.\n\n' +
        'Only the admin panel will continue to work.\n\n' +
        'Are you sure you want to enable maintenance mode?'
      );
      if (!confirmed) return;
    }

    setSavingMaintenance(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/maintenance/toggle', {
        enabled: newEnabled,
        message: maintenanceSettings.message,
        endTime: maintenanceSettings.endTime,
      });

      if (response.data.success) {
        setMaintenanceSettings(prev => ({ ...prev, enabled: newEnabled }));
        setMessage({ 
          type: 'success', 
          text: newEnabled 
            ? '🔒 Maintenance mode enabled. Website is now showing maintenance page to visitors.' 
            : '✅ Maintenance mode disabled. Website is now accessible to all visitors.'
        });
        // Refresh settings from server
        await fetchMaintenanceSettings();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to toggle maintenance mode' });
    } finally {
      setSavingMaintenance(false);
    }
  };

  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'AD';
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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-2xl sm:text-3xl font-bold">
            Admin Settings
          </h2>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Settings */}
        <div className="border border-[#e8dfd3] rounded-lg bg-white">
          <div className="p-6 border-b border-[#e8dfd3]">
            <span style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-xl font-semibold">
              Profile Settings
            </span>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <div 
                className="relative w-24 h-24 rounded-full border-2 border-[#bfa77b] flex items-center justify-center bg-[#faf8f5] text-2xl font-bold text-[#592a0d] cursor-pointer overflow-hidden group"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials()
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
              />
              <div>
                <button 
                  onClick={handleAvatarClick}
                  className="px-4 py-2 border border-[#bfa77b] text-[#592a0d] rounded-md hover:bg-[#bfa77b]/10 font-medium transition-colors"
                >
                  Change Avatar
                </button>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
              </div>
            </div>
            <div className="h-px bg-[#e8dfd3] my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    id="firstName" 
                    value={profile.firstName}
                    onChange={handleProfileChange}
                    className="pl-10 w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    id="lastName" 
                    value={profile.lastName}
                    onChange={handleProfileChange}
                    className="pl-10 w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    id="email" 
                    type="email" 
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="pl-10 w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                <input 
                  id="phone" 
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none" 
                />
              </div>
            </div>
            <button 
              onClick={handleUpdateProfile}
              disabled={saving}
              className="px-6 py-2 bg-[#592a0d] hover:bg-[#6d3a18] text-white shadow-md hover:shadow-lg transition-all rounded-md flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Update Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="border border-[#e8dfd3] rounded-lg bg-white">
          <div className="p-6 border-b border-[#e8dfd3]">
            <span style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-xl font-semibold">
              <Shield className="w-5 h-5 inline mr-2" /> Security Settings
            </span>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    id="currentPassword" 
                    type="password" 
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password" 
                    className="pl-10 w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    id="newPassword" 
                    type="password" 
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password" 
                    className="pl-10 w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none" 
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="px-6 py-2 bg-[#592a0d] hover:bg-[#6d3a18] text-white shadow-md hover:shadow-lg transition-all rounded-md flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" /> Change Password
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tax & Shipping Settings */}
        <div className="border border-[#e8dfd3] rounded-lg bg-white">
          <div className="p-6 border-b border-[#e8dfd3]">
            <span style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-xl font-semibold">
              <DollarSign className="w-5 h-5 inline mr-2" /> Tax & Shipping Settings
            </span>
          </div>
          <div className="p-6 space-y-8">
            {/* GST Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#592a0d] flex items-center gap-2">
                <Package className="w-5 h-5" />
                GST (General Sales Tax)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taxSettings.isEnabled}
                      onChange={(e) => handleTaxSettingsChange('isEnabled', e.target.checked)}
                      className="w-5 h-5 text-[#592a0d] border-[#e8dfd3] rounded focus:ring-[#bfa77b]"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable GST</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">GST Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxSettings.gstPercentage}
                    onChange={(e) => handleTaxSettingsChange('gstPercentage', parseFloat(e.target.value) || 0)}
                    disabled={!taxSettings.isEnabled}
                    className="w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 2"
                  />
                  <p className="text-xs text-gray-500">Applied to all products at checkout</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#e8dfd3]" />

            {/* Shipping Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#592a0d] flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Charges
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taxSettings.shippingCharges.isEnabled}
                      onChange={(e) => handleTaxSettingsChange('shippingCharges.isEnabled', e.target.checked)}
                      className="w-5 h-5 text-[#592a0d] border-[#e8dfd3] rounded focus:ring-[#bfa77b]"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Shipping Charges</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fixed Shipping Amount (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={taxSettings.shippingCharges.fixedAmount}
                      onChange={(e) => handleTaxSettingsChange('shippingCharges.fixedAmount', parseFloat(e.target.value) || 0)}
                      disabled={!taxSettings.shippingCharges.isEnabled}
                      className="w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="e.g., 200"
                    />
                    <p className="text-xs text-gray-500">Flat shipping fee per order</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Free Shipping Above (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={taxSettings.shippingCharges.freeShippingAbove}
                      onChange={(e) => handleTaxSettingsChange('shippingCharges.freeShippingAbove', parseFloat(e.target.value) || 0)}
                      disabled={!taxSettings.shippingCharges.isEnabled}
                      className="w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="e.g., 3000"
                    />
                    <p className="text-xs text-gray-500">Set to 0 to always charge shipping</p>
                  </div>
                </div>

                {/* Shipping Preview */}
                {taxSettings.shippingCharges.isEnabled && (
                  <div className="bg-[#faf8f5] border border-[#e8dfd3] rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[#592a0d] mb-2">Shipping Preview</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>• Orders below PKR {taxSettings.shippingCharges.freeShippingAbove.toLocaleString('en-PK')}: <strong>PKR {taxSettings.shippingCharges.fixedAmount.toLocaleString('en-PK')}</strong> shipping</p>
                      {taxSettings.shippingCharges.freeShippingAbove > 0 && (
                        <p>• Orders PKR {taxSettings.shippingCharges.freeShippingAbove.toLocaleString('en-PK')} and above: <strong>FREE</strong> shipping</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleUpdateTaxSettings}
              disabled={savingTax}
              className="px-6 py-2 bg-[#592a0d] hover:bg-[#6d3a18] text-white shadow-md hover:shadow-lg transition-all rounded-md flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingTax ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Tax & Shipping Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Maintenance Mode Settings */}
        <div className="border border-[#e8dfd3] rounded-lg bg-white">
          <div className="p-6 border-b border-[#e8dfd3]">
            <span style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-xl font-semibold">
              <Power className="w-5 h-5 inline mr-2" /> Maintenance Mode
            </span>
          </div>
          <div className="p-6 space-y-6">
            {/* Warning Banner */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-semibold mb-1">Important Information</p>
                  <p>When maintenance mode is enabled, all visitors will see a maintenance page. Only the admin panel will remain accessible.</p>
                </div>
              </div>
            </div>

            {/* Status Display */}
            <div className="flex items-center justify-between p-4 bg-[#faf8f5] border border-[#e8dfd3] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${maintenanceSettings.enabled ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <div>
                  <p className="font-semibold text-[#592a0d]">
                    {maintenanceSettings.enabled ? 'Maintenance Mode is ON' : 'Website is Online'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {maintenanceSettings.enabled 
                      ? 'Visitors are seeing the maintenance page' 
                      : 'Website is accessible to all visitors'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleMaintenance}
                disabled={savingMaintenance}
                className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  maintenanceSettings.enabled
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {savingMaintenance ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    {maintenanceSettings.enabled ? 'Turn OFF' : 'Turn ON'}
                  </>
                )}
              </button>
            </div>

            {/* Maintenance Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Maintenance Message</label>
                <textarea
                  value={maintenanceSettings.message}
                  onChange={(e) => handleMaintenanceChange('message', e.target.value)}
                  rows="3"
                  className="w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none resize-none"
                  placeholder="We are upgrading our website to serve you better. We'll be back soon!"
                />
                <p className="text-xs text-gray-500">This message will be displayed to visitors on the maintenance page</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Expected Back Online Time</label>
                <input
                  type="datetime-local"
                  value={maintenanceSettings.endTime ? new Date(maintenanceSettings.endTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleMaintenanceChange('endTime', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none"
                />
                <p className="text-xs text-gray-500">A countdown timer will show visitors when the site will be back (optional)</p>
              </div>
            </div>

            {/* Preview */}
            {maintenanceSettings.message && (
              <div className="bg-[#faf8f5] border border-[#e8dfd3] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#592a0d] mb-2">Preview</h4>
                <p className="text-sm text-gray-700">{maintenanceSettings.message}</p>
                {maintenanceSettings.endTime && (
                  <p className="text-xs text-gray-500 mt-2">
                    Expected back: {new Date(maintenanceSettings.endTime).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            )}

            <button 
              onClick={handleToggleMaintenance}
              disabled={savingMaintenance}
              className="px-6 py-2 bg-[#592a0d] hover:bg-[#6d3a18] text-white shadow-md hover:shadow-lg transition-all rounded-md flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingMaintenance ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Maintenance Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
