import React, { useState, useEffect } from 'react';
import './VolunteerVerification.css';
import apiClient from '../../services/apiClient';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { 
  FaUser, 
  FaGraduationCap, 
  FaCar, 
  FaFilePdf,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaSearch,
  FaFilter,
  FaUserCheck,
  FaUserClock
} from 'react-icons/fa';

const VolunteerVerification = () => {
  const { t } = useTranslation();
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSuccess, setShowSuccess] = useState({});

  // Load pending volunteers from backend
  useEffect(() => {
    const loadPending = async () => {
      try {
        const response = await apiClient.get('/volunteers/pending');
        const volunteersData = response.data?.data || response.data || [];
        // Normalize fields for UI consumption
        const mapped = volunteersData.map(v => {
          // Handle skills - can be string or array
          let skillsArray = [];
          if (Array.isArray(v.skills)) {
            skillsArray = v.skills;
          } else if (typeof v.skills === 'string' && v.skills) {
            skillsArray = v.skills.split(',').map(s => s.trim()).filter(Boolean);
          }
          
          return {
            id: v._id,
            name: v.name || v.fullName || 'Volunteer',
            email: v.email,
            phone: v.phone,
            skills: skillsArray,
            vehicle: v.vehicle,
            docsUrl: v.docsUrl,
            applicationDate: v.createdAt,
            experience: '',
            status: v.status,
          };
        });
        setPendingVolunteers(mapped);
      } catch (err) {
        console.error('Failed to load pending volunteers', err);
      } finally {
        setLoading(false);
      }
    };
    loadPending();
  }, []);

  const handleApprove = async (volunteerId) => {
    try {
      await apiClient.put(`/volunteers/${volunteerId}/verify`, { status: 'verified' });
      setPendingVolunteers(prev => prev.filter(v => v.id !== volunteerId));
      setShowSuccess(prev => ({ ...prev, [volunteerId]: 'approved' }));
      setTimeout(() => {
        setShowSuccess(prev => { const n = { ...prev }; delete n[volunteerId]; return n; });
      }, 3000);
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const handleReject = async (volunteerId) => {
    try {
      await apiClient.put(`/volunteers/${volunteerId}/verify`, { status: 'rejected' });
      setPendingVolunteers(prev => prev.filter(v => v.id !== volunteerId));
      setShowSuccess(prev => ({ ...prev, [volunteerId]: 'rejected' }));
      setTimeout(() => {
        setShowSuccess(prev => { const n = { ...prev }; delete n[volunteerId]; return n; });
      }, 3000);
    } catch (err) {
      console.error('Reject failed', err);
    }
  };

  const allSkills = [...new Set(pendingVolunteers.flatMap(v => v.skills))];

  const filteredVolunteers = pendingVolunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => volunteer.skills.includes(skill));
    return matchesSearch && matchesSkills;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>{t('Loading volunteers...')}</p>
      </div>
    );
  }

  return (
    <div className="volunteer-verification-admin">
      {/* Header */}
      <header className="admin-page-header">
        <div className="header-content">
          <h1 className="page-title">{t('Volunteer Verification')}</h1>
          <p className="page-subtitle">{t('Monitor and manage all reported incidents')}</p>
        </div>
        <div className="header-actions">
          <div className="stats-badge">
            <FaUserClock className="stat-icon" />
            <span>{pendingVolunteers.length} {t('Pending')}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Filters */}
      <div className="verification-filters glass-effect">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('Search volunteers by name')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="skills-filter">
          <div className="filter-header">
            <FaFilter className="filter-icon" />
            <span>{t('Filter by Type')}:</span>
          </div>
          <div className="skills-tags">
            {allSkills.map(skill => (
              <button
                key={skill}
                onClick={() => {
                  setSelectedSkills(prev =>
                    prev.includes(skill)
                      ? prev.filter(s => s !== skill)
                      : [...prev, skill]
                  );
                }}
                className={`skill-tag ${selectedSkills.includes(skill) ? 'active' : ''}`}
              >
                {skill}
              </button>
            ))}
            {selectedSkills.length > 0 && (
              <button
                onClick={() => setSelectedSkills([])}
                className="clear-filter-btn"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Volunteers Grid */}
      <div className="volunteers-grid">
        {filteredVolunteers.map(volunteer => (
          <div key={volunteer.id} className="volunteer-card glass-effect">
            {showSuccess[volunteer.id] && (
              <div className={`success-overlay ${showSuccess[volunteer.id]}`}>
                {showSuccess[volunteer.id] === 'approved' ? (
                  <>
                    <FaCheckCircle />
                    <span>{t('Approved successfully!')}</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle />
                    <span>{t('Rejected successfully')}</span>
                  </>
                )}
              </div>
            )}
            
            <div className="card-header">
              <div className="volunteer-avatar">
                <FaUser />
              </div>
              <div className="volunteer-info">
                <h3>{volunteer.name}</h3>
                <p className="volunteer-email">{volunteer.email}</p>
                <p className="volunteer-phone">{volunteer.phone}</p>
              </div>
              <span className="application-date">
                {t('Applied')}: {volunteer.applicationDate}
              </span>
            </div>

            <div className="card-body">
              {/* Skills */}
              <div className="info-section">
                <div className="section-header">
                  <FaGraduationCap className="section-icon" />
                  <h4>{t('Skills')}</h4>
                </div>
                <div className="skills-list">
                  {volunteer.skills.map((skill, index) => (
                    <span key={index} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="experience-text">{volunteer.experience}</p>
              </div>

              {/* Vehicle */}
              <div className="info-section">
                <div className="section-header">
                  <FaCar className="section-icon" />
                  <h4>{t('Vehicle')}</h4>
                </div>
                <p className="vehicle-info">{volunteer.vehicle}</p>
              </div>

              {/* Documents */}
              <div className="info-section">
                <div className="section-header">
                  <FaFilePdf className="section-icon" />
                  <h4>{t('Document')}</h4>
                </div>
                <a 
                  href={volunteer.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="doc-link"
                >
                  <FaEye />
                  <span>{t('View Documents')}</span>
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="card-footer">
              <div className="action-buttons">
                <button
                  onClick={() => handleApprove(volunteer.id)}
                  className="approve-btn"
                >
                  <FaCheckCircle />
                  {t('Approve')}
                </button>
                <button
                  onClick={() => handleReject(volunteer.id)}
                  className="reject-btn"
                >
                  <FaTimesCircle />
                  {t('Reject')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVolunteers.length === 0 && (
        <div className="empty-state glass-effect">
          <FaUserCheck className="empty-icon" />
          <h3>{t('No pending volunteers')}</h3>
          <p>{t('Monitor and manage all reported incidents')}</p>
        </div>
      )}

     
      </div>
   
  );
};

export default VolunteerVerification;