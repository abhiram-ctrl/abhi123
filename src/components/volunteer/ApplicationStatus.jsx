import React from 'react';
import { Clock, CheckCircle, XCircle, FileText, Car, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './ApplicationStatus.css';

const ApplicationStatus = ({ profile }) => {
  const { t } = useTranslation();
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified': return <CheckCircle size={24} />;
      case 'rejected': return <XCircle size={24} />;
      default: return <Clock size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return '#2ed573';
      case 'rejected': return '#ff4757';
      default: return '#ffa502';
    }
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'verified': return t('Your application has been verified! You can now receive and accept incidents.');
      case 'rejected': return t('Your application has been rejected. Please contact admin for more information.');
      default: return t('Your application is under review. Admin will verify soon.');
    }
  };

  return (
    <div className="application-status">
      <div className="status-header">
        <h2>{t('Application Status')}</h2>
        <div className="status-badge" style={{ backgroundColor: getStatusColor(profile?.status || 'pending') }}>
          {getStatusIcon(profile?.status || 'pending')}
          <span>{t((profile?.status || 'pending').toUpperCase())}</span>
        </div>
      </div>

      <div className="status-message">
        <p>{getStatusMessage(profile?.status || 'pending')}</p>
      </div>

      {profile && (
        <div className="application-details">
          <h3>{t('Application Details')}</h3>
          
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-icon">
                <UserCheck size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">{t('Skills')}</span>
                <span className="detail-value">{profile.skills || t('Not specified')}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <Car size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">{t('Vehicle')}</span>
                <span className="detail-value">
                  {profile.vehicle === 'none' ? t('No Vehicle') : profile.vehicle?.toUpperCase() || t('Not specified')}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FileText size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">{t('Document')}</span>
                <span className="detail-value">
                  {profile.documentName ? t('Uploaded ✓') : t('Not uploaded')}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <Clock size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">{t('Applied On')}</span>
                <span className="detail-value">
                  {profile?.appliedAt 
                    ? new Date(profile.appliedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : (profile?.createdAt 
                        ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                          })
                        : 'N/A')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!profile && (
        <div className="action-section">
          <p>You haven't submitted your volunteer application yet.</p>
          <button className="update-button" onClick={() => window.location.href = '/volunteer/apply'}>
            Submit Application
          </button>
        </div>
      )}

      {profile?.status === 'rejected' && (
        <div className="action-section">
          <p>Need to update your application?</p>
          <button className="update-button" onClick={() => window.location.href = '/volunteer/apply'}>
            Update Application
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;