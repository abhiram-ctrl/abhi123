// src/components/citizen/EmergencyContactsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  Bell, 
  BellOff,
  Search,
  Shield,
  Users,
  Star,
  X,
  ArrowLeft,
  Check,
  AlertTriangle,
  MessageSquare,
  Mail,
  Copy,
  ChevronRight,
  Filter,
  Heart,
  UserPlus
} from 'lucide-react';
import './EmergencyContactsPage.css';
import { contactService } from '../../services/incidentService';
import { useTranslation } from 'react-i18next';

const EmergencyContactsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Predefined emergency services
  const predefinedContacts = [
    { 
      id: 'police', 
      name: t('Police Emergency', { defaultValue: 'Police Emergency' }), 
      number: '100', 
      type: 'police',
      icon: '🚓',
      color: '#3498db',
      description: t('General emergency police response', { defaultValue: 'General emergency police response' }),
      isPredefined: true,
      notify: true
    },
    { 
      id: 'fire', 
      name: t('Fire Station', { defaultValue: 'Fire Station' }), 
      number: '101', 
      type: 'fire',
      icon: '🚒',
      color: '#e74c3c',
      description: t('Fire and rescue services', { defaultValue: 'Fire and rescue services' }),
      isPredefined: true,
      notify: true
    },
    { 
      id: 'ambulance', 
      name: t('Ambulance'), 
      number: '102', 
      type: 'medical',
      icon: '🚑',
      color: '#27ae60',
      description: t('Medical emergency and ambulance', { defaultValue: 'Medical emergency and ambulance' }),
      isPredefined: true,
      notify: true
    },
    { 
      id: 'women', 
      name: t('Women Helpline'), 
      number: '1091', 
      type: 'helpline',
      icon: '👮‍♀️',
      color: '#9b59b6',
      description: t('Women safety and emergency support', { defaultValue: 'Women safety and emergency support' }),
      isPredefined: true,
      notify: true
    },
    { 
      id: 'child', 
      name: t('Child Helpline', { defaultValue: 'Child Helpline' }), 
      number: '1098', 
      type: 'helpline',
      icon: '👶',
      color: '#f1c40f',
      description: t('Child protection and emergency', { defaultValue: 'Child protection and emergency' }),
      isPredefined: true,
      notify: true
    }
  ];

  // Custom contacts state
  const [customContacts, setCustomContacts] = useState([]);

  // Form state for new/edit contact
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    relation: 'Family',
    occupation: '',
    type: 'family',
    notify: true,
    isFavorite: false
  });

  // Load contacts from backend
  useEffect(() => {
    const load = async () => {
      try {
        const userId = (JSON.parse(localStorage.getItem('userData')||'{}').id) || localStorage.getItem('userId');
        if (!userId) return;
        const res = await contactService.getContacts(userId);
        const items = (res.data || res).map(c => ({
          id: c._id,
          name: c.name,
          number: c.phone,
          type: 'family',
          relation: c.relation || 'Family',
          occupation: c.occupation || '',
          icon: '👤',
          color: '#7f8c8d',
          isPredefined: false,
          notify: c.notifyOnSOS,
          isFavorite: !!c.isFavorite,
          lastContacted: 'Never'
        }));
        setCustomContacts(items);
      } catch (e) {
        console.warn('Failed to load contacts (continuing in local mode)', e);
      }
    };
    load();
  }, []);

  // Get contact type color
  const getTypeColor = (type) => {
    const colors = {
      police: '#3498db',
      fire: '#e74c3c',
      medical: '#27ae60',
      helpline: '#9b59b6',
      family: '#9b59b6',
      doctor: '#27ae60',
      neighbor: '#3498db',
      friend: '#f1c40f',
      colleague: '#e67e22'
    };
    return colors[type] || '#7f8c8d';
  };

  // Filter contacts based on active tab
  const getFilteredContacts = () => {
    let contacts = [...predefinedContacts, ...customContacts];
    
    if (searchQuery) {
      contacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.number.includes(searchQuery) ||
        contact.relation?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === 'emergency') {
      return contacts.filter(c => c.isPredefined);
    } else if (activeTab === 'personal') {
      return contacts.filter(c => !c.isPredefined);
    } else if (activeTab === 'favorites') {
      return contacts.filter(c => c.isFavorite);
    } else if (activeTab === 'notify') {
      return contacts.filter(c => c.notify);
    }
    
    return contacts;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = (JSON.parse(localStorage.getItem('userData')||'{}').id) || localStorage.getItem('userId');
    const payload = {
      userId,
      name: formData.name,
      phone: formData.number,
      relation: formData.relation,
      occupation: formData.occupation,
      notifyOnSOS: formData.notify,
      isFavorite: formData.isFavorite
    };
    try {
      if (editingContact) {
        await contactService.updateContact(editingContact.id, payload);
        setCustomContacts(prev => prev.map(c => c.id === editingContact.id ? {
          ...c,
          name: payload.name,
          number: payload.phone,
          relation: payload.relation,
          occupation: payload.occupation,
          notify: payload.notifyOnSOS,
          isFavorite: payload.isFavorite
        } : c));
      } else {
        const res = await contactService.addContact(payload);
        const saved = (res.data && res.data.contact) || payload;
        const item = {
          id: saved._id || `custom-${Date.now()}`,
          name: payload.name,
          number: payload.phone,
          type: formData.type,
          relation: payload.relation,
          occupation: payload.occupation,
          icon: getTypeIcon(formData.type),
          color: getTypeColor(formData.type),
          isPredefined: false,
          notify: payload.notifyOnSOS,
          isFavorite: payload.isFavorite,
          lastContacted: 'Never'
        };
        setCustomContacts(prev => [...prev, item]);
      }
    } catch (err) {
      console.error('Failed to save contact', err);
      alert('Failed to save contact. Please try again.');
    }
    handleCloseForm();
  };

  // Handle edit contact
  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      number: contact.number,
      relation: contact.relation || 'Family',
      occupation: contact.occupation || '',
      type: contact.type,
      notify: contact.notify,
      isFavorite: contact.isFavorite || false
    });
    setEditingContact(contact);
    setShowForm(true);
  };

  // Handle delete contact
  const handleDelete = async (contactId) => {
    try {
      await contactService.deleteContact(contactId);
      setCustomContacts(prev => prev.filter(contact => contact.id !== contactId));
    } catch (e) {
      console.error('Failed to delete contact', e);
      alert('Failed to delete contact. Please try again.');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Handle toggle notify
  const handleToggleNotify = async (contactId, e) => {
    e.stopPropagation();
    const current = customContacts.find(c => c.id === contactId);
    if (!current) return;
    const next = !current.notify;
    setCustomContacts(prev => prev.map(c => c.id === contactId ? { ...c, notify: next } : c));
    try {
      await contactService.updateContact(contactId, { notifyOnSOS: next });
    } catch (err) {
      console.error('Failed to update notifyOnSOS', err);
      setCustomContacts(prev => prev.map(c => c.id === contactId ? { ...c, notify: !next } : c));
      alert('Failed to update SOS notification. Please try again.');
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (contactId, e) => {
    e.stopPropagation();
    const current = customContacts.find(c => c.id === contactId);
    if (!current) return;
    const next = !current.isFavorite;
    setCustomContacts(prev => prev.map(c => c.id === contactId ? { ...c, isFavorite: next } : c));
    try {
      await contactService.updateContact(contactId, { isFavorite: next });
    } catch (err) {
      console.error('Failed to update favorite', err);
      setCustomContacts(prev => prev.map(c => c.id === contactId ? { ...c, isFavorite: !next } : c));
      alert('Failed to update favorite. Please try again.');
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingContact(null);
    setFormData({
      name: '',
      number: '',
      relation: 'Family',
      occupation: '',
      type: 'family',
      notify: true,
      isFavorite: false
    });
  };

  // Handle call
  const handleCall = (number, e) => {
    e?.stopPropagation();
    alert(`Calling: ${number}\n\nNote: This is a demo. In real app, this would initiate a phone call.`);
  };

  // Handle copy number
  const handleCopyNumber = (number, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(number);
    alert('Phone number copied to clipboard!');
  };

  // Handle SMS
  const handleSMS = (number, e) => {
    e?.stopPropagation();
    alert(`Sending SMS to: ${number}\n\nNote: This is a demo. In real app, this would open SMS app.`);
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      police: '🚓',
      fire: '🚒',
      medical: '🚑',
      helpline: '📞',
      family: '👨‍👩‍👧‍👦',
      doctor: '👨‍⚕️',
      neighbor: '🏠',
      friend: '👫',
      colleague: '👨‍💼'
    };
    return icons[type] || '👤';
  };

  // Stats
  const stats = {
    total: predefinedContacts.length + customContacts.length,
    personal: customContacts.length,
    sos: customContacts.filter(c => c.notify).length,
    favorites: customContacts.filter(c => c.isFavorite).length
  };

  return (
    <div className="emergency-contacts-page">
      {/* Header */}
      <header className="contacts-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/citizen/dashboard')}
        >
          <ArrowLeft size={20} />
          {t('Back to Dashboard')}
        </button>
        
        <div className="header-content">
          <div className="header-left">
            <h1>{t('Emergency Contacts')}</h1>
            <p className="subtitle">{t('Quick access to emergency services')}</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">{t('Total Contacts')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.sos}</div>
              <div className="stat-label">{t('SOS Enabled')}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="contacts-search-container">
        <div className="search-wrapper">
          <div className="search-icon">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder={t('Search contacts by name or number')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <button 
          className="add-contact-btn-main"
          onClick={() => setShowForm(true)}
        >
          <UserPlus size={20} />
          {t('Add Contact', { defaultValue: 'Add Contact' })}
        </button>
      </div>

      {/* Tabs */}
      <div className="contacts-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          {t('All Contacts')}
          <span className="tab-badge">{stats.total}</span>
        </button>
        <button 
          className={`tab ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          {t('Emergency Services')}
          <span className="tab-badge">{predefinedContacts.length}</span>
        </button>
        <button 
          className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          {t('Personal Contacts')}
          <span className="tab-badge">{stats.personal}</span>
        </button>
        <button 
          className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          {t('Favorites')}
          <span className="tab-badge">{stats.favorites}</span>
        </button>
        <button 
          className={`tab ${activeTab === 'notify' ? 'active' : ''}`}
          onClick={() => setActiveTab('notify')}
        >
          {t('SOS Notifications')}
          <span className="tab-badge">{stats.sos}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="contacts-main-content">
        {/* Left Side - Contacts List */}
        <div className="contacts-list-container">
          <div className="contacts-list-header">
            <h3>{t('Contacts')} ({getFilteredContacts().length})</h3>
            <div className="contacts-list-info">
              <Bell size={16} />
              <span>{t('Bell icon notification info')}</span>
            </div>
          </div>
          
          <div className="contacts-list">
            {getFilteredContacts().map(contact => (
              <div 
                key={contact.id}
                className={`contact-list-item ${showContactDetails === contact.id ? 'active' : ''}`}
                onClick={() => setShowContactDetails(contact.id === showContactDetails ? null : contact.id)}
              >
                <div className="contact-item-main">
                  <div className="contact-avatar" style={{ backgroundColor: contact.color + '20' }}>
                    <span className="avatar-icon" style={{ color: contact.color }}>
                      {contact.icon}
                    </span>
                    {contact.isFavorite && (
                      <div className="favorite-badge">
                        <Star size={12} fill="#f1c40f" color="#f1c40f" />
                      </div>
                    )}
                  </div>
                  
                  <div className="contact-info">
                    <div className="contact-name-row">
                      <h4>{contact.name}</h4>
                      {contact.notify && (
                        <div className="sos-badge">
                          <Bell size={12} />
                          <span>SOS</span>
                        </div>
                      )}
                    </div>
                    <p className="contact-detail">
                      {contact.isPredefined ? contact.description : contact.relation}
                    </p>
                    <p className="contact-number">
                      {contact.number}
                    </p>
                  </div>
                  
                  <div className="contact-actions-mini">
                    <button 
                      className={`notify-btn-mini ${contact.notify ? 'active' : ''}`}
                      onClick={(e) => !contact.isPredefined && handleToggleNotify(contact.id, e)}
                      disabled={contact.isPredefined}
                      title={contact.isPredefined ? "Always notified" : "Toggle SOS notification"}
                    >
                      <Bell size={16} />
                    </button>
                    <ChevronRight size={20} className="chevron-icon" />
                  </div>
                </div>
                
                {/* Quick Actions */}
                {showContactDetails === contact.id && (
                  <div className="contact-quick-actions">
                    <button 
                      className="quick-action-btn call"
                      onClick={(e) => handleCall(contact.number, e)}
                    >
                      <Phone size={18} />
                      {t('Call')}
                    </button>
                    <button 
                      className="quick-action-btn sms"
                      onClick={(e) => handleSMS(contact.number, e)}
                    >
                      <MessageSquare size={18} />
                      {t('SMS')}
                    </button>
                    <button 
                      className="quick-action-btn copy"
                      onClick={(e) => handleCopyNumber(contact.number, e)}
                    >
                      <Copy size={18} />
                      {t('Copy', { defaultValue: 'Copy' })}
                    </button>
                    {!contact.isPredefined && (
                      <>
                        <button 
                          className="quick-action-btn edit"
                          onClick={(e) => { e.stopPropagation(); handleEdit(contact); }}
                        >
                          <Edit2 size={18} />
                          {t('Edit')}
                        </button>
                        <button 
                          className="quick-action-btn delete"
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(contact.id); }}
                        >
                          <Trash2 size={18} />
                          {t('Delete')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {getFilteredContacts().length === 0 && (
              <div className="empty-contacts">
                <Users size={48} />
                <h4>{t('No contacts found')}</h4>
                <p>
                  {searchQuery 
                    ? t('No contacts match your search', { defaultValue: 'No contacts match your search. Try a different term.' })
                    : activeTab === 'personal' 
                      ? t('Add your first contact')
                      : t('No contacts in this category', { defaultValue: 'No contacts in this category.' })
                  }
                </p>
                {!searchQuery && activeTab === 'personal' && (
                  <button 
                    className="add-first-contact-btn"
                    onClick={() => setShowForm(true)}
                  >
                    <UserPlus size={20} />
                    {t('Add Your First Contact', { defaultValue: 'Add Your First Contact' })}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Emergency Services & Quick Actions */}
        <div className="contacts-side-panel">
          {/* Emergency Services Quick Access */}
          <div className="emergency-services-card">
            <div className="emergency-header">
              <Shield size={24} />
              <h3>{t('Emergency Services')}</h3>
            </div>
            <div className="emergency-services-list">
              {predefinedContacts.slice(0, 4).map(service => (
                <div 
                  key={service.id}
                  className="emergency-service-item"
                  onClick={() => handleCall(service.number)}
                >
                  <div className="service-icon" style={{ color: service.color }}>
                    {service.icon}
                  </div>
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <p>{service.number}</p>
                  </div>
                  <button className="call-service-btn">
                    <Phone size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              className="view-all-services"
              onClick={() => setActiveTab('emergency')}
            >
              {t('View All Emergency Services', { defaultValue: 'View All Emergency Services' })}
              <ChevronRight size={18} />
            </button>
          </div>

          {/* SOS Settings */}
          <div className="sos-settings-card">
            <div className="sos-header">
              <AlertTriangle size={24} />
              <h3>{t('SOS Settings', { defaultValue: 'SOS Settings' })}</h3>
            </div>
            <div className="sos-stats">
              <div className="sos-stat">
                <div className="sos-stat-value">{stats.sos}</div>
                <div className="sos-stat-label">{t('Contacts will be notified', { defaultValue: 'Contacts will be notified' })}</div>
              </div>
            </div>
            <p className="sos-info">
              {t('During an SOS emergency', { defaultValue: 'During an SOS emergency, all contacts with the bell icon will receive immediate notifications.' })}
            </p>
            <button 
              className="manage-sos-btn"
              onClick={() => setActiveTab('notify')}
            >
              <Bell size={18} />
              {t('Manage SOS Contacts', { defaultValue: 'Manage SOS Contacts' })}
            </button>
          </div>

          {/* Quick Tips */}
          
        </div>
      </div>

      {/* Add/Edit Contact Form Modal */}
      {showForm && (
        <div className="contact-form-modal">
          <div className="modal-overlay" onClick={handleCloseForm}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingContact ? t('Edit Contact', { defaultValue: 'Edit Contact' }) : t('Add New Contact', { defaultValue: 'Add New Contact' })}</h2>
              <button className="close-modal" onClick={handleCloseForm}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-section">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  {t('Contact Name', { defaultValue: 'Contact Name' })} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t('Enter full name', { defaultValue: 'Enter full name' })}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-section">
                <label className="form-label">
                  <span className="label-icon">📱</span>
                  {t('Phone Number', { defaultValue: 'Phone Number' })} *
                </label>
                <input
                  type="tel"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  placeholder={t('+91 9876543210', { defaultValue: '+91 9876543210' })}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">{t('Relation')}</label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({...formData, relation: e.target.value})}
                    className="form-select"
                  >
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-section">
                  <label className="form-label">{t('Type', { defaultValue: 'Type' })}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="family">Family</option>
                    <option value="doctor">Doctor</option>
                    <option value="neighbor">Neighbor</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                  </select>
                </div>
              </div>
              
              <div className="form-section">
                <label className="form-label">
                  <span className="label-icon">💼</span>
                  {t('Occupation (Optional)', { defaultValue: 'Occupation (Optional)' })}
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  placeholder={t('e.g., Doctor, Engineer', { defaultValue: 'e.g., Doctor, Engineer' })}
                  className="form-input"
                />
              </div>
              
              <div className="form-options">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.notify}
                    onChange={(e) => setFormData({...formData, notify: e.target.checked})}
                    className="checkbox-input"
                  />
                  <div className="checkbox-label">
                    <Bell size={18} />
                    <div>
                      <div className="checkbox-title">{t('Notify during SOS', { defaultValue: 'Notify during SOS' })}</div>
                      <div className="checkbox-description">{t('Send emergency alerts to this contact', { defaultValue: 'Send emergency alerts to this contact' })}</div>
                    </div>
                  </div>
                </label>
                
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData({...formData, isFavorite: e.target.checked})}
                    className="checkbox-input"
                  />
                  <div className="checkbox-label">
                    <Star size={18} />
                    <div>
                      <div className="checkbox-title">{t('Add to Favorites')}</div>
                      <div className="checkbox-description">{t('Mark as frequently contacted', { defaultValue: 'Mark as frequently contacted' })}</div>
                    </div>
                  </div>
                </label>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleCloseForm}
                >
                  {t('Cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  <Check size={20} />
                  {editingContact ? t('Update Contact', { defaultValue: 'Update Contact' }) : t('Add Contact', { defaultValue: 'Add Contact' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}></div>
          <div className="modal-content-small">
            <div className="modal-icon">
              <AlertTriangle size={48} color="#e74c3c" />
            </div>
            <h3>{t('Delete Contact?', { defaultValue: 'Delete Contact?' })}</h3>
            <p className="modal-text">
              {t('Are you sure you want to delete this contact?', { defaultValue: 'Are you sure you want to delete this contact? This action cannot be undone.' })}
            </p>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                {t('Cancel')}
              </button>
              <button 
                className="btn-danger"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                <Trash2 size={18} />
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsPage;