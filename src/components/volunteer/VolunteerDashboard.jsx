import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, Clock, CheckCircle, XCircle, User, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { socketService } from '../../services/socket';
import { volunteerAPI } from '../../services/api';
import ApplicationStatus from "./ApplicationStatus";
import IncidentCard from "./IncidentCard";
import SocketConnection from "./SocketConnection";
import './VolunteerDashboard.css';

// ✅ Helper to allow only real DB incidents (no dummy/demo)
const isRealIncident = (incident) => {
  return (
    incident &&
    incident._id &&            // DB incidents always have _id
    !incident.isDemo &&        // common demo flag
    !incident.demo             // backup demo flag
  );
};

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignedIncidents, setAssignedIncidents] = useState([]);
  const [newIncidents, setNewIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');
  const [notifications, setNotifications] = useState([]);

  const incidentsLocked = profile?.status !== 'verified';

  // Load user data and profile
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        const savedTab = localStorage.getItem('volunteerActiveTab');
        setActiveTab(savedTab || 'status');
        const targetId = user.id || user._id;
        if (targetId) {
          fetchProfile(targetId);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (userId) => {
    setIsLoading(true);
    try {
      const response = await volunteerAPI.getProfile(userId);
      const profileData = response?.data || { status: 'pending' };
      setProfile(profileData);

      const nextTab = profileData.status === 'verified'
        ? localStorage.getItem('volunteerActiveTab') || 'assigned'
        : 'status';
      setActiveTab(nextTab);

      if (profileData.status === 'verified') {
        await fetchAssignedIncidents(userId);
        await fetchNewIncidents();
      } else {
        setAssignedIncidents([]);
        setNewIncidents([]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({ status: 'pending' });
      setActiveTab('status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedIncidents = async (userId) => {
    try {
      const response = await volunteerAPI.getAssignedIncidents(userId);
     setAssignedIncidents(
  (response?.data || []).filter(isRealIncident)
);

    } catch (error) {
      console.error('Error fetching incidents:', error);
      setAssignedIncidents([]);
    }
  };

  const fetchNewIncidents = async () => {
    try {
      console.log('Fetching new incidents...');
      const response = await volunteerAPI.getNewIncidents();
      console.log('New incidents response:', response);
     const incidents = response?.data || [];
const filtered = incidents.filter(isRealIncident);

// Remove duplicates by _id
const unique = Array.from(
  new Map(filtered.map(i => [i._id, i])).values()
);

setNewIncidents(unique);

    } catch (error) {
      console.error('Error fetching new incidents:', error);
      setNewIncidents([]);
    }
  };

  // Socket connection for real-time incidents + periodic polling
  useEffect(() => {
    if (incidentsLocked || !profile || profile.status !== 'verified') return;

    try {
      const socket = socketService.connect();
      
      socket.on('connect', () => {
        console.log('Connected to socket server for incidents');
      });

   socket.on('new-incident', (incident) => {
  if (!isRealIncident(incident)) return; // 🚫 block dummy

  setNewIncidents(prev => {
    const exists = prev.some(i => i._id === incident._id);
    if (exists) return prev;
    return [incident, ...prev.slice(0, 9)];
  });
});


      socket.on('incident-updated', (incident) => {
        console.log('Incident updated via socket:', incident);
        // Update if it's in assigned incidents
        setAssignedIncidents(prev => 
          prev.map(i => (i._id || i.id) === (incident._id || incident.id) ? incident : i)
        );
        // Remove from new incidents if it's now assigned
        if (incident.assignedVolunteerId) {
          setNewIncidents(prev => 
            prev.filter(i => (i._id || i.id) !== (incident._id || incident.id))
          );
        }
      });

      // Listen for volunteer notifications (assignments, safety info, route info)
      socket.on('volunteer_notification', (notif) => {
        console.log('Received volunteer notification:', notif);
        // Check if this notification is for the current volunteer
        if (notif.volunteerIds && notif.volunteerIds.includes(userData?.id)) {
          const newNotif = {
            id: Date.now(),
            incidentId: notif.incidentId,
            message: notif.message,
            safetyCautions: notif.safetyCautions,
            routeInfo: notif.routeInfo,
            sentAt: notif.sentAt,
            read: false
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 10));
          // Auto-dismiss after 10 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
          }, 10000);
        }
      });

      // Periodic polling every 30 seconds as backup
      const pollInterval = setInterval(() => {
        console.log('Polling for new incidents...');
        fetchNewIncidents();
        if (userData?.id) {
          fetchAssignedIncidents(userData.id);
        }
      }, 30000);

      return () => {
        socketService.disconnect();
        clearInterval(pollInterval);
      };
    } catch (error) {
      console.log('Socket setup error (non-critical):', error);
    }
  }, [profile?.status, userData?.id]);

  const handleTabClick = (tab) => {
    if (incidentsLocked && (tab === 'assigned' || tab === 'new')) {
      setActiveTab('status');
      return;
    }
    setActiveTab(tab);
    localStorage.setItem('volunteerActiveTab', tab);
  };

  const handleAcceptIncident = async (incidentId) => {
    if (incidentsLocked) {
      alert('Admin verification required before accepting incidents.');
      setActiveTab('status');
      return;
    }

    try {
      const response = await volunteerAPI.acceptIncident(incidentId, userData?.id);
      console.log('Accept response:', response);
      
      // Find incident using both _id and id
      const incident = newIncidents.find(i => (i._id || i.id) === incidentId);
      if (incident) {
        const updatedIncident = { 
          ...incident, 
          status: 'assigned',
          assignedVolunteerId: userData?.id 
        };
        setAssignedIncidents(prev => [updatedIncident, ...prev]);
        setNewIncidents(prev => prev.filter(i => (i._id || i.id) !== incidentId));
        alert('Incident accepted successfully! You can now view it in Assigned Incidents.');
        
        // Switch to assigned tab
        setActiveTab('assigned');
        localStorage.setItem('volunteerActiveTab', 'assigned');
      }
    } catch (error) {
      console.error('Error accepting incident:', error);
      alert('Error accepting incident. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    socketService.disconnect();
    navigate('/login?role=volunteer');
  };

  return (
    <div className="volunteer-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            <User size={32} />
          </div>
          <div className="user-info">
            <h3>{userData?.name || t('Volunteer')}</h3>
            <p className="user-email">{userData?.email || 'user@example.com'}</p>
            <p className="user-role">{t('Volunteer')}</p>
            <small className="demo-badge">{t('Demo Mode')}</small>
          </div>
        </div>

        <div className="sidebar-nav">
          {!incidentsLocked && (
            <button 
              className={`nav-item ${activeTab === 'assigned' ? 'active' : ''}`}
              onClick={() => handleTabClick('assigned')}
            >
              <MapPin size={20} />
              <span>{t('Assigned Incidents')}</span>
              {assignedIncidents.length > 0 && (
                <span className="badge">{assignedIncidents.length}</span>
              )}
            </button>
          )}

          {!incidentsLocked && (
            <button 
              className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => handleTabClick('new')}
            >
              <AlertTriangle size={20} />
              <span>{t('New Incidents')}</span>
              {newIncidents.length > 0 && (
                <span className="badge alert">{newIncidents.length}</span>
              )}
            </button>
          )}

          <button 
            className={`nav-item ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => handleTabClick('status')}
          >
            <CheckCircle size={20} />
            <span>{t('Application Status')}</span>
          </button>
        </div>

        <div className="sidebar-footer">
          {(!profile || profile.status !== 'verified') && (
            <button 
              className="apply-button"
              onClick={() => navigate('/volunteer/apply')}
            >
              {t('Complete Application')}
            </button>
          )}
          
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            {t('Log Out')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>{t('Volunteer Dashboard')}</h1>
            <SocketConnection />
          </div>
          <div className="header-right">
            <span className={`status-badge ${profile?.status || 'pending'}`}>
              {t(profile?.status?.toUpperCase() || 'PENDING')}
            </span>
            <div className="demo-notice">
              
            </div>
          </div>
        </div>

        {/* Real-time Notifications */}
        {notifications.length > 0 && (
          <div className="notifications-stack">
            {notifications.map(notif => (
              <div key={notif.id} className="notification-card glass-effect">
                <div className="notification-header">
                  <Bell size={18} className="notification-icon" />
                  <span className="notification-title">Assignment Notification</span>
                  <button 
                    className="close-btn"
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                  >
                    ×
                  </button>
                </div>
                <div className="notification-content">
                  {notif.message && (
                    <p className="message"><strong>Message:</strong> {notif.message}</p>
                  )}
                  {notif.safetyCautions && (
                    <p className="safety"><strong>Safety Cautions:</strong> {notif.safetyCautions}</p>
                  )}
                  {notif.routeInfo && (
                    <div className="route-info">
                      <strong>Route Information:</strong>
                      {notif.routeInfo.start && <p>📍 From: {notif.routeInfo.start}</p>}
                      {notif.routeInfo.destination && <p>📍 To: {notif.routeInfo.destination}</p>}
                      {notif.routeInfo.waypointNotes && <p>⚠️ {notif.routeInfo.waypointNotes}</p>}
                    </div>
                  )}
                  <small className="timestamp">{new Date(notif.sentAt).toLocaleTimeString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application Status Warning */}
        {(!profile || profile.status !== 'verified') && (
          <div className="verification-warning">
            <AlertTriangle size={24} />
            <div>
              <h3>{t('Account Not Verified')}</h3>
              <p>{t('You cannot receive or accept incidents until your application is verified by admin.')}</p>
              {(!profile || profile.status === 'pending') && (
                <button 
                  className="apply-now-button"
                  onClick={() => navigate('/volunteer/apply')}
                >
                  {t('Complete Your Application')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="dashboard-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t('Loading dashboard...')}</p>
              <small>{t('Using demo data - no backend required')}</small>
            </div>
          ) : (
            <>
              {/* Assigned Incidents Tab */}
              {activeTab === 'assigned' && (
                <div className="incidents-section">
                  <div className="section-header">
                    <h2>{t('Incidents Assigned to You')}</h2>
                    <span className="count-badge">{assignedIncidents.length} {t('incidents')}</span>
                  </div>
                  
                  {assignedIncidents.length === 0 ? (
                    <div className="empty-state">
                      <MapPin size={48} />
                      <h3>{t('No Assigned Incidents')}</h3>
                      <p>{t('You don\'t have any incidents assigned to you yet.')}</p>
                    </div>
                  ) : (
                    <div className="incidents-grid">
                      {assignedIncidents.map(incident => (
                        <IncidentCard 
                          key={incident._id || incident.id}
                          incident={incident}
                          type="assigned"
                          onAccept={handleAcceptIncident}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* New Incidents Tab */}
              {activeTab === 'new' && (
                <div className="incidents-section">
                  <div className="section-header">
                    <h2>{t('New Incidents')}</h2>
                    <div className="live-indicator">
                      <span className="pulse"></span>
                      <span>{t('LIVE')}</span>
                    </div>
                  </div>
                  
                  {newIncidents.length === 0 ? (
                    <div className="empty-state">
                      <Bell size={48} />
                      <h3>{t('No New Incidents')}</h3>
                      <p>{t('New incidents will appear here in real-time.')}</p>
                    </div>
                  ) : (
                    <>
                      <p className="demo-hint">
                        <small>{t('Click "Accept Incident" to move incidents to Assigned tab')}</small>
                      </p>
                      <div className="incidents-grid">
                        {newIncidents.map(incident => (
                          <IncidentCard 
                            key={incident._id || incident.id}
                            incident={incident}
                            type="new"
                            onAccept={handleAcceptIncident}
                            isVerified={profile?.status === 'verified'}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Application Status Tab */}
              {activeTab === 'status' && (
                <ApplicationStatus profile={profile} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;