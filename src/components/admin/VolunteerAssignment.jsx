import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VolunteerAssignment.css';
import { adminAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { FaArrowLeft, FaCheckCircle, FaUserShield, FaRoute, FaExclamationTriangle } from 'react-icons/fa';

const VolunteerAssignment = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', skill: '' });
  const [notifyPayload, setNotifyPayload] = useState({
    message: 'You have been requested to assist this incident.',
    safetyCautions: 'Wear protective gear, follow traffic rules, avoid unsafe areas.',
    routeInfo: {
      start: '',
      destination: '',
      waypointNotes: 'Use main roads; avoid flooded zones.'
    }
  });
  const [isNotifying, setIsNotifying] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getAvailableVolunteers();
        if (res.success) {
          setVolunteers(Array.isArray(res.data) ? res.data : []);
        } else {
          setError(res.message || 'Failed to load volunteers');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const toggleSelect = (vid) => {
    setSelectedIds(prev => prev.includes(vid) ? prev.filter(x => x !== vid) : [...prev, vid]);
  };

  const filteredList = volunteers.filter(v => {
    const searchMatch = filters.search
      ? (v.name || '').toLowerCase().includes(filters.search.toLowerCase()) || (v.phone || '').includes(filters.search)
      : true;
    const skillMatch = filters.skill
      ? (Array.isArray(v.skills) ? v.skills : String(v.skills || '')).toString().toLowerCase().includes(filters.skill.toLowerCase())
      : true;
    return searchMatch && skillMatch;
  });

  const notifySelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsNotifying(true);
      const res = await adminAPI.notifyVolunteers(selectedIds, id, notifyPayload);
      if (res.success) {
        setSuccessMsg('Notifications sent to selected volunteers');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(res.message || 'Failed to send notifications');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsNotifying(false);
    }
  };

  const assignSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsAssigning(true);
      // Assign each volunteer sequentially to avoid server overload
      for (const vid of selectedIds) {
        const res = await adminAPI.assignVolunteer(id, vid);
        if (!res.success) throw new Error(res.message || 'Assign failed');
      }
      setSuccessMsg('Selected volunteers assigned to incident');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>{t('Loading volunteers...')}</p>
      </div>
    );
  }

  return (
    <div className="volunteer-assignment-page">
      <header className="admin-page-header">
        <div className="header-left">
          <button onClick={() => navigate(`/admin/incidents/${id}`)} className="back-btn">
            <FaArrowLeft />
            {t('Back to Incidents')}
          </button>
          <div className="header-content">
            <h1 className="page-title">{t('Assign Officers')}</h1>
            <p className="page-subtitle">{t('Assign officers to incident')}</p>
          </div>
        </div>
        <div className="header-actions">
          <LanguageSwitcher />
        </div>
      </header>

      {error && (
        <div className="error-banner">{error}</div>
      )}
      {successMsg && (
        <div className="success-banner"><FaCheckCircle /> {successMsg}</div>
      )}

      <div className="assignment-grid">
        {/* Left: Filters and compose notification */}
        <div className="compose-card glass-effect">
          <h3><FaExclamationTriangle className="info-icon" /> {t('Risk Zone')}</h3>
          <div className="filters">
            <input
              className="text-input"
              placeholder={t('Search volunteers by name')}
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
            <input
              className="text-input"
              placeholder={t('Filter by Type')}
              value={filters.skill}
              onChange={e => setFilters({ ...filters, skill: e.target.value })}
            />
          </div>
          <div className="notify-form">
            <label>{t('Notes')}</label>
            <textarea
              className="text-area"
              rows={3}
              value={notifyPayload.message}
              onChange={e => setNotifyPayload({ ...notifyPayload, message: e.target.value })}
            />
            <label>{t('Risk Zone')}</label>
            <textarea
              className="text-area"
              rows={3}
              value={notifyPayload.safetyCautions}
              onChange={e => setNotifyPayload({ ...notifyPayload, safetyCautions: e.target.value })}
            />
            <label><FaRoute /> {t('Location')}</label>
            <div className="route-grid">
              <input
                className="text-input"
                placeholder={t('Location')}
                value={notifyPayload.routeInfo.start}
                onChange={e => setNotifyPayload({ ...notifyPayload, routeInfo: { ...notifyPayload.routeInfo, start: e.target.value } })}
              />
              <input
                className="text-input"
                placeholder={t('Location')}
                value={notifyPayload.routeInfo.destination}
                onChange={e => setNotifyPayload({ ...notifyPayload, routeInfo: { ...notifyPayload.routeInfo, destination: e.target.value } })}
              />
            </div>
            <input
              className="text-input"
              placeholder={t('Notes')}
              value={notifyPayload.routeInfo.waypointNotes}
              onChange={e => setNotifyPayload({ ...notifyPayload, routeInfo: { ...notifyPayload.routeInfo, waypointNotes: e.target.value } })}
            />

            <div className="compose-actions">
              <button
                className="action-btn notify-btn"
                disabled={isNotifying || selectedIds.length === 0}
                onClick={notifySelected}
              >
                {isNotifying ? t('Assigning...') : t('Select')}
              </button>
              <button
                className="action-btn assign-btn"
                disabled={isAssigning || selectedIds.length === 0}
                onClick={assignSelected}
              >
                <FaUserShield /> {isAssigning ? t('Assigning...') : t('Assign Officers')}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Volunteers list */}
        <div className="list-card glass-effect">
          <h3>{t('Available Officers')}</h3>
          {filteredList.length === 0 ? (
            <p className="muted">{t('No pending volunteers')}</p>
          ) : (
            <ul className="volunteer-list">
              {filteredList.map(v => (
                <li key={v.id || v._id} className={`volunteer-item ${selectedIds.includes(v.id || v._id) ? 'selected' : ''}`}
                    onClick={() => toggleSelect(v.id || v._id)}>
                  <div className="volunteer-header">
                    <span className="volunteer-name">{v.name}</span>
                    <span className="volunteer-distance">{v.distance}</span>
                  </div>
                  <div className="volunteer-details">
                    <div className="skills">
                      {Array.isArray(v.skills) ? v.skills.slice(0, 4).map((s, idx) => (
                        <span className="skill-tag" key={idx}>{s}</span>
                      )) : (
                        v.skills ? <span className="skill-tag">{v.skills}</span> : <span className="skill-tag">{t('Not specified')}</span>
                      )}
                    </div>
                    <div className="contact">
                      {v.phone && <span className="contact-item">{v.phone}</span>}
                      {v.email && <span className="contact-item">{v.email}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerAssignment;
