import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { volunteerAPI } from '../../services/api';
import LanguageSwitcher from '../LanguageSwitcher';
import './VolunteerIncidentDetail.css';

const VolunteerIncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [incident, setIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('accepted');

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching incident details for ID:', id);

        const response = await volunteerAPI.getIncidentById(id);
        console.log('Incident response:', response);

        if (response?.data) {
          setIncident(response.data);
          setStatus(response.data.status || 'accepted');
        } else {
          alert('Incident not found');
          navigate('/volunteer/dashboard');
        }
      } catch (error) {
        console.error('Error fetching incident:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        alert('Error loading incident details');
        navigate('/volunteer/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchIncident();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="incident-detail-loading">
        <div className="spinner"></div>
        <p>{t('Loading incident details...')}</p>
      </div>
    );
  }

  if (!incident) return null;

  return (
    <div className="volunteer-incident-detail">
      <div className="incident-detail-header">
        <button
          className="back-button"
          onClick={() => navigate('/volunteer/dashboard')}
        >
          <ArrowLeft size={20} />
          {t('Back to Dashboard')}
        </button>
        <LanguageSwitcher />
      </div>

      <div className="incident-overview">
        <h1>{incident.title}</h1>

        <div className="incident-meta">
          <span className={`priority-badge ${incident.priority}`}>
            {incident.priority?.toUpperCase()}
          </span>
          <span className={`status-badge ${status}`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="overview-grid">
          <div className="overview-card">
            <MapPin size={20} />
            <p>
              {typeof incident.location === 'string'
                ? incident.location
                : incident.location?.address || t('Location not specified')}
            </p>
          </div>

          <div className="overview-card">
            <Clock size={20} />
            <p>
              {incident.createdAt
                ? new Date(incident.createdAt).toLocaleString()
                : 'N/A'}
            </p>
          </div>

          <div className="overview-card">
            <Users size={20} />
            <p>{incident.peopleInvolved || 0} {t('people')}</p>
          </div>

          <div className="overview-card">
            <AlertCircle size={20} />
            <p>{incident.type || t('Emergency')}</p>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h2>{t('Incident Description')}</h2>
        <p>{incident.description}</p>
      </div>

      <div className="detail-section">
        <h2>{t('Reporter Information')}</h2>
        <p><User size={16} /> {incident.reporter?.name || 'Anonymous'}</p>
        {incident.reporter?.phone && (
          <button onClick={() => window.open(`tel:${incident.reporter.phone}`)}>
            <Phone size={16} /> {t('Call Reporter')}
          </button>
        )}
      </div>

      <div className="action-buttons">
        <button onClick={() => setStatus('in-progress')}>
          <CheckCircle size={18} /> {t('In Progress')}
        </button>
        <button onClick={() => setStatus('resolved')}>
          <CheckCircle size={18} /> {t('Resolved')}
        </button>
        <button className="danger" onClick={() => setStatus('cancelled')}>
          <XCircle size={18} /> {t('Cancel')}
        </button>
      </div>
    </div>
  );
};

export default VolunteerIncidentDetail;
