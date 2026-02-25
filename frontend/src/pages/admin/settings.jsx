import { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Shield, Save, Camera } from 'lucide-react';
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
    role: '',
    bio: '',
    avatar: null,
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    fetchProfile();
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
        role: user.role || 'admin',
        bio: user.bio || '',
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
      formData.append('role', profile.role);
      formData.append('bio', profile.bio);
      
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
                <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  value={profile.role}
                  onChange={handleProfileChange}
                  className="w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
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
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</label>
              <textarea 
                id="bio" 
                value={profile.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself..." 
                rows={4} 
                className="w-full border border-[#e8dfd3] rounded-md py-2 px-3 focus:border-[#bfa77b] focus:ring-[#bfa77b] focus:outline-none" 
              />
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
      </div>
    </AdminLayout>
  );
}
