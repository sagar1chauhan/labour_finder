import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiSearch, FiMessageCircle, FiMail, FiPhone,
  FiChevronRight, FiHelpCircle, FiBook, FiAlertCircle,
  FiCheckCircle, FiClock, FiSend
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';

const HelpSupport = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [supportInfo, setSupportInfo] = useState({
    email: 'support@homestr.com',
    phone: '',
    whatsapp: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/public/config');
        if (response.data?.success && response.data?.settings) {
          const { supportEmail, supportPhone, supportWhatsapp } = response.data.settings;
          setSupportInfo({
            email: supportEmail || 'support@homestr.com',
            phone: supportPhone || '',
            whatsapp: supportWhatsapp || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch support settings:', error);
      }
    };
    fetchSettings();
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // FAQ Categories
  const categories = [
    {
      id: 'booking',
      title: 'Booking & Services',
      icon: FiBook,
      color: '#889400',
      questions: [
        {
          q: 'How do I book a service?',
          a: 'Navigate to the home page, select your desired service category, choose a service provider, select time slot, and confirm booking.'
        },
        {
          q: 'Can I cancel or reschedule my booking?',
          a: 'Yes, you can cancel or reschedule your booking from the My Bookings page up to 2 hours before the scheduled time.'
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We accept all major payment methods including UPI, Credit/Debit cards, Net Banking, and Wallets.'
        },
      ]
    },
    {
      id: 'payment',
      title: 'Payments & Wallet',
      icon: FiClock,
      color: '#d97706',
      questions: [
        {
          q: 'How do I add money to my wallet?',
          a: 'Go to Wallet page, click on "Add Money", enter amount, and complete the payment using your preferred method.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes, we use industry-standard encryption and never store your complete card details on our servers.'
        },
        {
          q: 'How long does refund take?',
          a: 'Refunds are processed within 5-7 business days and will be credited to your original payment method or wallet.'
        },
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: FiAlertCircle,
      color: '#0f172a',
      questions: [
        {
          q: 'How do I update my profile?',
          a: 'Go to Account page, tap on the edit icon next to your name, update your details, and save changes.'
        },
        {
          q: 'How do I change my phone number?',
          a: 'Phone number can be changed from Settings > Update Phone Number. OTP verification will be required.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, you can request account deletion from Settings > Account Management > Delete Account.'
        },
      ]
    },
  ];

  // Quick actions
  const quickActions = [
    {
      id: 'chat',
      title: 'WhatsApp Chat',
      subtitle: 'Chat with our support team',
      icon: FiMessageCircle,
      color: '#25D366',
      action: () => {
        if (supportInfo.whatsapp) {
          const cleanNumber = supportInfo.whatsapp.replace(/\D/g, '');
          window.location.href = `whatsapp://send?phone=${cleanNumber}`;
        } else {
          toast('WhatsApp support is currently unavailable');
        }
      }
    },
    {
      id: 'email',
      title: 'Email Us',
      subtitle: supportInfo.email,
      icon: FiMail,
      color: '#10B981',
      action: () => {
        window.location.href = `mailto:${supportInfo.email}`;
      }
    },
    {
      id: 'call',
      title: 'Call Us',
      subtitle: supportInfo.phone || 'Not Available',
      icon: FiPhone,
      color: '#F59E0B',
      action: () => {
        if (supportInfo.phone) {
          window.location.href = `tel:${supportInfo.phone}`;
        } else {
          toast('Phone support is currently unavailable');
        }
      }
    },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all fields');
      return;
    }

    // TODO: Send to backend
    toast.success('Your message has been sent! We\'ll get back to you soon.');
    setShowContactForm(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const filteredQuestions = categories.flatMap(cat =>
    cat.questions.filter(q =>
      searchQuery === '' ||
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(q => ({ ...q, category: cat.title, color: cat.color }))
  );

  return (
    <div className="min-h-screen pb-6 relative" style={{ backgroundColor: '#fbfde8' }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-50 px-6 pt-5 pb-4 rounded-b-[24px] shadow-md shadow-gray-200/50"
        style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight uppercase">Help & Support</h1>
              <p className="text-[8px] font-bold text-gray-800 uppercase tracking-[0.2em] opacity-80 leading-none mt-0.5">Customer Care</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[10px] font-bold text-gray-900 rounded-xl bg-white/50 backdrop-blur-md border border-white/30 focus:border-white focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      <main className="px-6 pt-6">
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 ml-4">Contact Us</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map(action => {
              let href = null;
              if (action.id === 'chat' && supportInfo.whatsapp) {
                href = `whatsapp://send?phone=${supportInfo.whatsapp.replace(/\D/g, '')}`;
              } else if (action.id === 'email' && supportInfo.email) {
                href = `mailto:${supportInfo.email}`;
              } else if (action.id === 'call' && supportInfo.phone) {
                href = `tel:${supportInfo.phone.replace(/\D/g, '')}`;
              }

              const Component = href ? 'a' : 'button';

              return (
                <Component
                  key={action.id}
                  href={href}
                  onClick={!href ? action.action : undefined}
                  className="bg-white rounded-[24px] p-4 shadow-sm hover:shadow-md transition-all active:scale-98 border border-gray-50 flex items-center gap-4 w-full"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <action.icon className="w-6 h-6" style={{ color: action.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-[11px] font-black text-gray-900 leading-tight mb-1">{action.title}</h3>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{action.subtitle}</p>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-gray-300" />
                </Component>
              );
            })}
          </div>
        </div>

        {/* Submit a Request Button */}
        <button
          onClick={() => setShowContactForm(true)}
          className="w-full bg-[#0f172a] text-white rounded-[22px] py-4.5 font-black text-[10px] uppercase tracking-[0.3em] shadow-md shadow-gray-200 active:scale-98 transition-all mb-8 flex items-center justify-center gap-2.5"
        >
          <FiSend className="w-4 h-4" />
          Submit a Request
        </button>

        {/* FAQ Categories */}
        {searchQuery === '' && (
          <div className="mb-6">
            <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 ml-4">Browse by Category</h2>
            <div className="space-y-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                  className="w-full bg-white rounded-[24px] p-4 shadow-sm hover:shadow-md transition-all border border-gray-50 text-left mb-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <category.icon className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <h3 className="font-semibold text-gray-900">{category.title}</h3>
                    </div>
                    <FiChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${selectedCategory === category.id ? 'rotate-90' : ''}`}
                    />
                  </div>

                  {/* Expanded Questions */}
                  {selectedCategory === category.id && (
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      {category.questions.map((item, idx) => (
                        <div key={idx} className="text-left">
                          <div className="flex items-start gap-2 mb-2">
                            <FiHelpCircle className="w-4 h-4 text-[#889400] mt-0.5 flex-shrink-0" />
                            <p className="font-bold text-gray-900 text-xs">{item.q}</p>
                          </div>
                          <p className="text-[10px] font-medium text-gray-500 ml-6 leading-relaxed">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery !== '' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Search Results ({filteredQuestions.length})
            </h2>
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No results found for "{searchQuery}"</p>
                <p className="text-sm text-gray-500 mt-2">Try different keywords or contact support</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-2 mb-2">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <FiHelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="font-medium text-gray-900 text-sm">{item.q}</p>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Submit a Request</h2>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 font-semibold shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <FiSend className="w-5 h-5" />
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;
