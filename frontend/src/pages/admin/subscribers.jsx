import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { subscriberService } from '../../services/subscriber';
import { Search, Mail, Users, UserCheck, UserX, Trash2, ToggleLeft, ToggleRight, RefreshCw, Send, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function Subscribers() {
  const toast = useToast();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0, emailsSent: 0, emailsFailed: 0, emailConfigured: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [emailLogs, setEmailLogs] = useState([]);
  const [showEmailLogs, setShowEmailLogs] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await subscriberService.getAll();
      setSubscribers(response.data.subscribers || []);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await subscriberService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await subscriberService.getEmailLogs({ limit: 50 });
      setEmailLogs(response.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleToggleStatus = async (subscriber) => {
    const newStatus = subscriber.status === 'active' ? 'unsubscribed' : 'active';
    try {
      await subscriberService.updateStatus(subscriber._id, newStatus);
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to update status');
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      await subscriberService.delete(id);
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      toast.error('Error', error.response?.data?.message || 'Failed to delete subscriber');
    }
  };

  const handleViewEmailLogs = () => {
    setShowEmailLogs(true);
    fetchEmailLogs();
  };

  const handleTestEmail = async () => {
    try {
      const response = await subscriberService.testEmailConfig();
      const data = response.data;
      if (data.success) {
        toast.success('Email Configuration Valid', `SMTP User: ${data.smtpUser}`);
      } else {
        toast.error('Configuration Error', data.hint || data.message);
      }
    } catch (error) {
      toast.error('Test Failed', error.response?.data?.message || error.message);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-2xl sm:text-3xl font-bold">
            Subscribers
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleViewEmailLogs}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#592a0d] text-[#bfa77b] rounded-lg hover:bg-[#6b3410] transition-colors text-sm sm:text-base"
            >
              <Send className="w-4 h-4" />
              Email Logs
            </button>
            <button
              onClick={() => { fetchSubscribers(); fetchStats(); }}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-[#bfa77b] text-[#592a0d] rounded-lg hover:bg-[#bfa77b]/10 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Email Configuration Status */}
        <div className={`p-4 rounded-lg border ${stats.emailConfigured ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${stats.emailConfigured ? 'text-green-600' : 'text-amber-600'}`} />
              <div>
                <p className={`font-medium ${stats.emailConfigured ? 'text-green-800' : 'text-amber-800'}`}>
                  {stats.emailConfigured ? 'Email Service Active' : 'Email Service Not Configured'}
                </p>
                <p className={`text-sm ${stats.emailConfigured ? 'text-green-600' : 'text-amber-600'}`}>
                  {stats.emailConfigured 
                    ? 'Subscribers will receive email notifications when new products or collections are added.'
                    : 'Configure SMTP settings in backend/.env to enable email notifications.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTestEmail}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-[#e8dfd3] p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-[#592a0d]/10 rounded-lg">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-[#592a0d]" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg sm:text-xl font-bold text-[#592a0d]">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#e8dfd3] p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#e8dfd3] p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gray-100 rounded-lg">
                <UserX className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Unsubscribed</p>
                <p className="text-lg sm:text-xl font-bold text-gray-600">{stats.unsubscribed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#e8dfd3] p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Emails Sent</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.emailsSent || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[#e8dfd3] p-3 sm:p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Failed</p>
                <p className="text-lg sm:text-xl font-bold text-red-600">{stats.emailsFailed || 0}</p>
              </div>
            </div>
          </div>
        </div>


        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#e8dfd3] p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] bg-white text-[#592a0d]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] bg-white text-[#592a0d]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg border border-[#e8dfd3] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#e8dfd3]">
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-lg sm:text-xl font-semibold">
              All Subscribers ({filteredSubscribers.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading subscribers...</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || filterStatus !== 'all' ? 'No subscribers found matching your filters.' : 'No subscribers yet.'}
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#faf8f5] border-b border-[#e8dfd3]">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-[#592a0d]">Subscribed Date</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-[#592a0d]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber._id} className="border-b border-[#e8dfd3] hover:bg-[#faf8f5] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#592a0d]/10 rounded-full">
                              <Mail className="w-4 h-4 text-[#592a0d]" />
                            </div>
                            <span className="text-sm text-[#592a0d]">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            subscriber.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(subscriber.subscribedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(subscriber)}
                              className={`p-2 rounded-lg transition-colors ${
                                subscriber.status === 'active'
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              title={subscriber.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {subscriber.status === 'active' ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(subscriber._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Hidden on desktop */}
              <div className="lg:hidden divide-y divide-[#e8dfd3]">
                {filteredSubscribers.map((subscriber) => (
                  <div key={subscriber._id} className="p-4 hover:bg-[#faf8f5] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      {/* Subscriber Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-[#592a0d]/10 rounded-full flex-shrink-0">
                            <Mail className="w-4 h-4 text-[#592a0d]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#592a0d] truncate">
                              {subscriber.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Subscribed {formatDate(subscriber.subscribedAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            subscriber.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {subscriber.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleStatus(subscriber)}
                          className={`p-2 rounded-lg transition-colors ${
                            subscriber.status === 'active'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                          title={subscriber.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {subscriber.status === 'active' ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(subscriber._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>


        {/* Email Logs Modal */}
        {showEmailLogs && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#e8dfd3] flex items-center justify-between">
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#592a0d' }} className="text-xl font-bold">
                  Email Notification Logs
                </h3>
                <button
                  onClick={() => setShowEmailLogs(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {logsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading email logs...</div>
                ) : emailLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No email logs yet.</p>
                    <p className="text-sm mt-2">Email logs will appear here when notifications are sent.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emailLogs.map((log) => (
                      <div
                        key={log._id}
                        className={`p-4 rounded-lg border ${
                          log.status === 'sent' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {log.status === 'sent' ? (
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              )}
                              <span className={`text-sm font-medium ${log.status === 'sent' ? 'text-green-800' : 'text-red-800'}`}>
                                {log.status === 'sent' ? 'Sent' : 'Failed'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                log.type === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {log.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">{log.recipient}</p>
                            <p className="text-xs text-gray-500 mt-1 truncate">{log.subject}</p>
                            {log.error && (
                              <p className="text-xs text-red-600 mt-1">{log.error}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">{formatDate(log.sentAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-[#e8dfd3] bg-[#faf8f5]">
                <p className="text-xs text-gray-500 text-center">
                  Showing last 50 email logs. Logs are automatically deleted after 30 days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
