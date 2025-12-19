import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, UserCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background with emergency-themed gradient */}
      <div className="background-gradient" />
      
      <header className="landing-header">
        <GlassCard className="header-card" padding="1rem 2rem">
          <div className="header-content">
            <Shield size={32} className="logo-icon" />
            <h1>Disaster Guardian</h1>
            <span className="tagline">Your safety, our priority</span>
          </div>
        </GlassCard>
      </header>

      <main className="landing-main">
        <div className="hero-section">
          <GlassCard className="hero-card">
            <h2>Choose Your Role</h2>
            <p className="hero-subtitle">Select how you want to use Disaster Guardian</p>
            
            <div className="role-buttons">
              <button 
                className="role-button citizen"
                onClick={() => navigate('/login?role=citizen')}
              >
                <div className="button-icon">
                  <Users size={28} />
                </div>
                <div className="button-text">
                  <h3>Citizen</h3>
                  <p>Report emergencies, request help, and stay safe</p>
                </div>
              </button>

              <button 
                className="role-button volunteer"
                onClick={() => navigate('/login?role=volunteer')}
              >
                <div className="button-icon">
                  <UserCheck size={28} />
                </div>
                <div className="button-text">
                  <h3>Volunteer</h3>
                  <p>Respond to emergencies and help your community</p>
                </div>
              </button>

              <button 
                className="role-button admin"
                onClick={() => navigate('/admin-login')}
              >
                <div className="button-icon">
                  <Shield size={28} />
                </div>
                <div className="button-text">
                  <h3>Administrator</h3>
                  <p>Manage incidents, volunteers, and system operations</p>
                </div>
              </button>
            </div>

            <div className="donation-section">
              <p className="donation-text">Support our mission to help communities in need</p>
              <button 
                className="donation-button"
                onClick={() => navigate('/donate')}
              >
                Donate Now
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="features-section">
          <GlassCard className="feature-card">
            <h4>Emergency SOS</h4>
            <p>Instant one-tap emergency alert system to notify authorities and contacts</p>
          </GlassCard>
          <GlassCard className="feature-card">
            <h4>Real-time Alerts</h4>
            <p>Get notified about emergencies, weather warnings, and safety updates in your area</p>
          </GlassCard>
          <GlassCard className="feature-card">
            <h4>Community Support</h4>
            <p>Connect with volunteers and neighbors during crises for mutual assistance</p>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;