import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Edit2, Trash2, Save, X, Eye, Mail, Phone, MapPin,
  Truck, RotateCcw, CreditCard, Shield, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import * as supportService from '../../services/support';

const ICON_OPTIONS = [
  { value: 'truck', label: 'Truck', icon: Truck },
  { value: 'rotateCcw', label: 'Rotate', icon: RotateCcw },
  { value: 'creditCard', label: 'Credit Card', icon: CreditCard },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'mapPin', label: 'Map Pin', icon: MapPin },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'mail', label: 'Mail', icon: Mail },
];

const getIconComponent = (iconName) => {
  const found = ICON_OPTIONS.find(i => i.value === iconName);
  return found ? found.icon : HelpCircle;
};

export default function AdminSupport() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('cards');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [cards, setCards] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);
  const [whatsapp, setWhatsapp] = useState({ phoneNumber: '', buttonText: '', subtitle: '', active: true });
  const [policies, setPolicies] = useState([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, type: '', id: null });
  const [expandedMessage, setExpandedMessage] = useState(null);

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'cards') {
        const res = await supportService.adminGetSupportCards();
        setCards(res.cards || []);
      } else if (activeTab === 'faqs') {
        const res = await supportService.adminGetFAQs();
        setFaqs(res.faqs || []);
      } else if (activeTab === 'messages') {
        const res = await supportService.adminGetContactMessages();
        setMessages(res.messages || []);
      } else if (activeTab === 'contact') {
        const res = await supportService.adminGetContactInfo();
        setContactInfo(res.contactInfo || []);
      } else if (activeTab === 'whatsapp') {
        const res = await supportService.getWhatsAppSettings();
        setWhatsapp(res.settings || { phoneNumber: '', buttonText: '', subtitle: '', active: true });
      } else if (activeTab === 'policies') {
        const res = await supportService.adminGetPolicies();
        setPolicies(res.policies || []);
      }
    } catch (err) {
      toast.error('Error', err.message);
    }
    setLoading(false);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'card') {
      setFormData(item || { icon: 'truck', title: '', description: '', order: 0, active: true });
    } else if (type === 'faq') {
      setFormData(item || { question: '', answer: '', order: 0, active: true });
    } else if (type === 'contactInfo') {
      setFormData(item || { icon: 'mapPin', title: '', content: '', order: 0, active: true });
    } else if (type === 'policy') {
      setFormData(item || { title: '', content: '', contentType: 'bullets', order: 0, active: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (modalType === 'card') {
        if (editingItem) {
          await supportService.adminUpdateSupportCard(editingItem._id, formData);
          toast.success('Success', 'Card updated');
        } else {
          await supportService.adminCreateSupportCard(formData);
          toast.success('Success', 'Card created');
        }
      } else if (modalType === 'faq') {
        if (editingItem) {
          await supportService.adminUpdateFAQ(editingItem._id, formData);
          toast.success('Success', 'FAQ updated');
        } else {
          await supportService.adminCreateFAQ(formData);
          toast.success('Success', 'FAQ created');
        }
      } else if (modalType === 'contactInfo') {
        if (editingItem) {
          await supportService.adminUpdateContactInfo(editingItem._id, formData);
          toast.success('Success', 'Contact info updated');
        } else {
          await supportService.adminCreateContactInfo(formData);
          toast.success('Success', 'Contact info created');
        }
      } else if (modalType === 'policy') {
        if (editingItem) {
          await supportService.adminUpdatePolicy(editingItem._id, formData);
          toast.success('Success', 'Policy updated');
        } else {
          await supportService.adminCreatePolicy(formData);
          toast.success('Success', 'Policy created');
        }
      }
      closeModal();
      loadData();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const { type, id } = deleteModal;
      if (type === 'card') await supportService.adminDeleteSupportCard(id);
      else if (type === 'faq') await supportService.adminDeleteFAQ(id);
      else if (type === 'contactInfo') await supportService.adminDeleteContactInfo(id);
      else if (type === 'policy') await supportService.adminDeletePolicy(id);
      else if (type === 'message') await supportService.adminDeleteContactMessage(id);
      toast.success('Success', 'Item deleted');
      setDeleteModal({ show: false, type: '', id: null });
      loadData();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const handleWhatsAppSave = async () => {
    try {
      await supportService.adminUpdateWhatsAppSettings(whatsapp);
      toast.success('Success', 'WhatsApp settings updated');
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await supportService.adminMarkMessageRead(id);
      loadData();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const tabs = [
    { id: 'cards', label: 'Support Cards' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'messages', label: 'Messages' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'policies', label: 'Policies' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#592a0d]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Support Page Management
        </h1>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg border border-[#e8dfd3] p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                  activeTab === tab.id
                    ? 'bg-[#592a0d] text-[#bfa77b]'
                    : 'bg-white text-[#592a0d] border border-[#e7dcc8] hover:border-[#bfa77b]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

          {loading ? (
            <div className="bg-white rounded-lg border border-[#e8dfd3] p-8 text-center text-[#592a0d]">Loading...</div>
          ) : (
            <>
              {/* Support Cards Tab */}
              {activeTab === 'cards' && (
                <div className="bg-white rounded-lg border border-[#e8dfd3] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-[#592a0d]">Support Cards</h2>
                    <button onClick={() => openModal('card')} className="flex items-center justify-center gap-2 bg-[#592a0d] text-[#bfa77b] px-4 py-2 rounded-lg hover:bg-[#6d3a18] text-sm sm:text-base">
                      <Plus className="w-4 h-4" /> Add Card
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map(card => {
                      const IconComp = getIconComponent(card.icon);
                      return (
                        <div key={card._id} className={`bg-[#faf8f5] p-4 rounded-lg border-2 ${card.active ? 'border-[#e7dcc8]' : 'border-red-200 opacity-60'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                <IconComp className="w-5 h-5 sm:w-6 sm:h-6 text-[#bfa77b]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-[#592a0d] text-sm sm:text-base truncate">{card.title}</h3>
                                <p className="text-xs sm:text-sm text-[#592a0d]/70 line-clamp-2">{card.description}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button onClick={() => openModal('card', card)} className="p-2 text-[#bfa77b] hover:bg-white rounded"><Edit2 className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                              <button onClick={() => setDeleteModal({ show: true, type: 'card', id: card._id })} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-[#592a0d]/50">Order: {card.order} | {card.active ? 'Active' : 'Inactive'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAQs Tab */}
              {activeTab === 'faqs' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#592a0d]">FAQs</h2>
                    <button onClick={() => openModal('faq')} className="flex items-center gap-2 bg-[#592a0d] text-[#bfa77b] px-4 py-2 rounded-lg hover:bg-[#6d3a18]">
                      <Plus className="w-4 h-4" /> Add FAQ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {faqs.map(faq => (
                      <div key={faq._id} className={`bg-white p-4 rounded-lg border-2 ${faq.active ? 'border-[#e7dcc8]' : 'border-red-200 opacity-60'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#592a0d]">{faq.question}</h3>
                            <p className="text-sm text-[#592a0d]/70 mt-1">{faq.answer}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button onClick={() => openModal('faq', faq)} className="p-2 text-[#bfa77b] hover:bg-[#f5f1e8] rounded"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteModal({ show: true, type: 'faq', id: faq._id })} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-[#592a0d]/50">Order: {faq.order} | {faq.active ? 'Active' : 'Inactive'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div>
                  <h2 className="text-xl font-semibold text-[#592a0d] mb-4">Contact Messages</h2>
                  {messages.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg border-2 border-[#e7dcc8] text-center text-[#592a0d]/70">No messages yet</div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map(msg => (
                        <div key={msg._id} className={`bg-white p-4 rounded-lg border-2 ${msg.read ? 'border-[#e7dcc8]' : 'border-[#bfa77b]'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[#592a0d]">{msg.name}</h3>
                                {!msg.read && <span className="px-2 py-0.5 bg-[#bfa77b] text-[#592a0d] text-xs rounded-full">New</span>}
                              </div>
                              <p className="text-sm text-[#592a0d]/70">{msg.email}</p>
                              <p className="text-sm font-medium text-[#592a0d] mt-2">{msg.subject}</p>
                              {expandedMessage === msg._id && (
                                <p className="text-sm text-[#592a0d]/80 mt-2 whitespace-pre-wrap">{msg.message}</p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button onClick={() => setExpandedMessage(expandedMessage === msg._id ? null : msg._id)} className="p-2 text-[#bfa77b] hover:bg-[#f5f1e8] rounded">
                                {expandedMessage === msg._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              {!msg.read && (
                                <button onClick={() => handleMarkRead(msg._id)} className="p-2 text-green-600 hover:bg-green-50 rounded"><Eye className="w-4 h-4" /></button>
                              )}
                              <button onClick={() => setDeleteModal({ show: true, type: 'message', id: msg._id })} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-[#592a0d]/50">{new Date(msg.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Contact Info Tab */}
              {activeTab === 'contact' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#592a0d]">Contact Info Cards</h2>
                    <button onClick={() => openModal('contactInfo')} className="flex items-center gap-2 bg-[#592a0d] text-[#bfa77b] px-4 py-2 rounded-lg hover:bg-[#6d3a18]">
                      <Plus className="w-4 h-4" /> Add Contact Info
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contactInfo.map(info => {
                      const IconComp = getIconComponent(info.icon);
                      return (
                        <div key={info._id} className={`bg-white p-4 rounded-lg border-2 ${info.active ? 'border-[#e7dcc8]' : 'border-red-200 opacity-60'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-[#f5f1e8] rounded-full flex items-center justify-center flex-shrink-0">
                                <IconComp className="w-5 h-5 text-[#bfa77b]" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-[#592a0d]">{info.title}</h3>
                                <p className="text-sm text-[#592a0d]/70 whitespace-pre-line">{info.content}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => openModal('contactInfo', info)} className="p-2 text-[#bfa77b] hover:bg-[#f5f1e8] rounded"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteModal({ show: true, type: 'contactInfo', id: info._id })} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WhatsApp Tab */}
              {activeTab === 'whatsapp' && (
                <div>
                  <h2 className="text-xl font-semibold text-[#592a0d] mb-4">WhatsApp Settings</h2>
                  <div className="bg-white p-6 rounded-lg border-2 border-[#e7dcc8] max-w-lg">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#592a0d] mb-1">Phone Number (without + or spaces)</label>
                        <input
                          type="text"
                          value={whatsapp.phoneNumber}
                          onChange={(e) => setWhatsapp({ ...whatsapp, phoneNumber: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                          placeholder="923001234567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#592a0d] mb-1">Button Text</label>
                        <input
                          type="text"
                          value={whatsapp.buttonText}
                          onChange={(e) => setWhatsapp({ ...whatsapp, buttonText: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                          placeholder="Start WhatsApp Chat"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#592a0d] mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={whatsapp.subtitle}
                          onChange={(e) => setWhatsapp({ ...whatsapp, subtitle: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                          placeholder="Chat with us instantly"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setWhatsapp({ ...whatsapp, active: !whatsapp.active })}
                          className={`relative w-12 h-6 rounded-full transition-colors ${whatsapp.active ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${whatsapp.active ? 'left-1 translate-x-6' : 'left-1'}`} />
                        </button>
                        <span className="text-sm text-[#592a0d]">{whatsapp.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <button onClick={handleWhatsAppSave} className="flex items-center gap-2 bg-[#592a0d] text-[#bfa77b] px-4 py-2 rounded-lg hover:bg-[#6d3a18]">
                        <Save className="w-4 h-4" /> Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Policies Tab */}
              {activeTab === 'policies' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#592a0d]">Policies</h2>
                    <button onClick={() => openModal('policy')} className="flex items-center gap-2 bg-[#592a0d] text-[#bfa77b] px-4 py-2 rounded-lg hover:bg-[#6d3a18]">
                      <Plus className="w-4 h-4" /> Add Policy
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {policies.map(policy => (
                      <div key={policy._id} className={`bg-white p-4 rounded-lg border-2 ${policy.active ? 'border-[#e7dcc8]' : 'border-red-200 opacity-60'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-[#592a0d]">{policy.title}</h3>
                          <div className="flex gap-1">
                            <button onClick={() => openModal('policy', policy)} className="p-2 text-[#bfa77b] hover:bg-[#f5f1e8] rounded"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteModal({ show: true, type: 'policy', id: policy._id })} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="text-sm text-[#592a0d]/70">
                          {policy.contentType === 'bullets' ? (
                            <ul className="list-disc list-inside space-y-1">
                              {policy.content.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                            </ul>
                          ) : (
                            <p className="whitespace-pre-line">{policy.content}</p>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-[#592a0d]/50">Order: {policy.order} | {policy.contentType} | {policy.active ? 'Active' : 'Inactive'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-[#592a0d]">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'card' ? 'Support Card' : modalType === 'faq' ? 'FAQ' : modalType === 'contactInfo' ? 'Contact Info' : 'Policy'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-[#f5f1e8] rounded"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* Card Form */}
              {modalType === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Icon</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                    >
                      {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* FAQ Form */}
              {modalType === 'faq' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Question</label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Answer</label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Contact Info Form */}
              {modalType === 'contactInfo' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Icon</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                    >
                      {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Content (use new lines for multiple lines)</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Policy Form */}
              {modalType === 'policy' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Content Type</label>
                    <select
                      value={formData.contentType}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                    >
                      <option value="bullets">Bullet Points</option>
                      <option value="paragraph">Paragraph</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#592a0d] mb-1">Content (one bullet per line for bullets)</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={5}
                      className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-[#592a0d] mb-1">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-[#e7dcc8] rounded-lg focus:border-[#bfa77b] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.active ? 'left-1 translate-x-6' : 'left-1'}`} />
                </button>
                <span className="text-sm text-[#592a0d]">{formData.active ? 'Active' : 'Inactive'}</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={closeModal} className="flex-1 px-4 py-2 border-2 border-[#e7dcc8] text-[#592a0d] rounded-lg hover:bg-[#f5f1e8]">Cancel</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-[#592a0d] text-[#bfa77b] rounded-lg hover:bg-[#6d3a18]">Save</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, type: '', id: null })}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </AdminLayout>
  );
}
