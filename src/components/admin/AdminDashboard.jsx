import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LanguageSwitcher from '../LanguageSwitcher';
import HeatMap from '../HeatMap';
import { FaMap, FaList } from 'react-icons/fa';
import {
  FaExclamationTriangle,
  FaUsers,
  FaUserShield,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaFire,
  FaChartLine,
  FaArrowUp,
  FaSpinner
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  
  const [stats, setStats] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    totalVolunteers: 0,
    approvedVolunteers: 0,
    pendingVolunteers: 0,
    totalOfficers: 0,
    totalDonations: 0
  });

  const [recentIncidents, setRecentIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    loadDashboardData();
  }, [i18n.language]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [incidentsRes, volunteersRes, officersRes, donationsRes] = await Promise.all([
        adminAPI.getIncidents().catch(err => {
          console.error('Incidents error:', err);
          return { data: [], success: false };
        }),
        adminAPI.getVolunteers().catch(err => {
          console.error('Volunteers error:', err);
          return { data: [], success: false };
        }),
        adminAPI.getOfficers().catch(err => {
          console.error('Officers error:', err);
          return { data: [], success: false };
        }),
        adminAPI.getDonations().catch(err => {
          console.error('Donations error:', err);
          return { data: [], success: false };
        })
      ]);

      // Extract data arrays - handle different response formats
      const incidents = Array.isArray(incidentsRes.data) ? incidentsRes.data : (incidentsRes.data?.data || []);
      const volunteersData = Array.isArray(volunteersRes.data) ? volunteersRes.data : (volunteersRes.data?.data || []);
      
      // Officers endpoint returns differently - can be officers array or data.officers
      let officersArray = [];
      if (Array.isArray(officersRes.data)) {
        officersArray = officersRes.data;
      } else if (Array.isArray(officersRes.officers)) {
        officersArray = officersRes.officers;
      } else if (officersRes.data?.officers && Array.isArray(officersRes.data.officers)) {
        officersArray = officersRes.data.officers;
      }
      
      const donations = Array.isArray(donationsRes.data) ? donationsRes.data : (donationsRes.data?.data || []);

      // Calculate stats with proper filtering
      const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'ongoing').length;
      const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'completed').length;
      const approvedVolunteers = volunteersData.filter(v => v.status === 'approved' || v.verified === true).length;
      const pendingVolunteers = volunteersData.filter(v => v.status === 'pending' || v.status === 'awaiting').length;
      const totalDonations = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

      setStats({
        totalIncidents: incidents.length,
        activeIncidents,
        resolvedIncidents,
        totalVolunteers: volunteersData.length,
        approvedVolunteers,
        pendingVolunteers,
        totalOfficers: officersArray.length,
        totalDonations: totalDonations.toFixed(2)
      });

      // Get recent incidents (last 5)
      const recent = incidents.slice(0, 5);
      setRecentIncidents(recent);
      
      // Set volunteers for heatmap
      setVolunteers(volunteersData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <FaSpinner className="loading-spinner" />
            <p>{t('Loading dashboard...')}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-alert glass-effect">
          <FaExclamationTriangle />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="dashboard-header">
            <div className="header-left">
              <h1>{t('Admin Dashboard')}</h1>
              <p className="current-date">{currentDate}</p>
            </div>
            <div className="header-right">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {/* Total Incidents */}
            <div className="stat-card glass-effect incident-card">
              <div className="stat-icon incident-icon">
                <FaFire />
              </div>
              <div className="stat-content">
                <p className="stat-label">{t('Total Incidents')}</p>
                <h3 className="stat-value">{stats.totalIncidents}</h3>
                <div className="stat-breakdown">
                  <span className="active"><FaClock /> {t('Active')}: {stats.activeIncidents}</span>
                  <span className="resolved"><FaCheckCircle /> {t('Resolved')}: {stats.resolvedIncidents}</span>
                </div>
              </div>
            </div>

            {/* Total Volunteers */}
            <div className="stat-card glass-effect volunteer-card">
              <div className="stat-icon volunteer-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <p className="stat-label">{t('Total Volunteers')}</p>
                <h3 className="stat-value">{stats.totalVolunteers}</h3>
                <div className="stat-breakdown">
                  <span className="approved"><FaCheckCircle /> {t('Approved')}: {stats.approvedVolunteers}</span>
                  <span className="pending"><FaClock /> {t('Pending')}: {stats.pendingVolunteers}</span>
                </div>
              </div>
            </div>

            {/* Total Officers */}
            <div className="stat-card glass-effect officer-card">
              <div className="stat-icon officer-icon">
                <FaUserShield />
              </div>
              <div className="stat-content">
                <p className="stat-label">{t('Total Officers')}</p>
                <h3 className="stat-value">{stats.totalOfficers}</h3>
                <p className="stat-subtitle">{t('On Duty')}</p>
              </div>
            </div>

            {/* Total Donations */}
            <div className="stat-card glass-effect donation-card">
              <div className="stat-icon donation-icon">
                <FaMoneyBillWave />
              </div>
              <div className="stat-content">
                <p className="stat-label">{t('Total Donations')}</p>
                <h3 className="stat-value">${stats.totalDonations}</h3>
                <p className="stat-subtitle">{t('Total Received')}</p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="quick-actions">
            <h2>{t('Quick Actions')}</h2>
            <div className="action-buttons">
              <Link to="/admin/volunteers/verification" className="action-btn verify-btn glass-effect">
                <div className="btn-icon">
                  <FaUserShield />
                </div>
                <div className="btn-content">
                  <h3>{t('Verify Volunteers')}</h3>
                  <p>{t('Review pending applications')}</p>
                  <span className="badge">{stats.pendingVolunteers}</span>
                </div>
                <FaArrowUp className="btn-arrow" />
              </Link>

              <Link to="/admin/donations" className="action-btn donations-btn glass-effect">
                <div className="btn-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="btn-content">
                  <h3>{t('Manage Donations')}</h3>
                  <p>{t('View donation statistics')}</p>
                  <span className="badge">${stats.totalDonations}</span>
                </div>
                <FaArrowUp className="btn-arrow" />
              </Link>

              <Link to="/admin/incidents" className="action-btn incidents-btn glass-effect">
                <div className="btn-icon">
                  <FaFire />
                </div>
                <div className="btn-content">
                  <h3>{t('Resolve Incidents')}</h3>
                  <p>{t('Track incident progress')}</p>
                  <span className="badge">{stats.activeIncidents}</span>
                </div>
                <FaArrowUp className="btn-arrow" />
              </Link>
            </div>
          </div>

          {/* Recent Incidents */}
          {recentIncidents.length > 0 && (
            <div className="recent-section glass-effect">
              <div className="section-header">
                <h2>{t('Recent Incidents')}</h2>
                <Link to="/admin/incidents" className="view-all-link">
                  {t('View All')} <FaArrowUp />
                </Link>
              </div>
              <div className="incidents-list">
                {recentIncidents.map((incident, idx) => (
                  <div key={idx} className="incident-item">
                    <div className="incident-icon">
                      <FaFire />
                    </div>
                    <div className="incident-info">
                      <h4>{incident.title || incident.type || 'Incident'}</h4>
                      <p className="incident-location">
                        {typeof incident.location === 'object' && incident.location?.address 
                          ? incident.location.address 
                          : typeof incident.location === 'string' 
                            ? incident.location 
                            : 'Location pending'}
                      </p>
                      <p className="incident-status" data-status={incident.status}>
                        {incident.status?.toUpperCase()}
                      </p>
                    </div>
                    <div className="incident-date">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap Toggle */}
          <div className="heatmap-section">
            <button 
              onClick={() => setShowHeatMap(!showHeatMap)} 
              className="heatmap-toggle glass-effect"
            >
              <FaMap /> {showHeatMap ? t('Hide Heatmap') : t('Show Heatmap')}
            </button>
            {showHeatMap && volunteers.length > 0 && (
              <HeatMap volunteers={volunteers} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
