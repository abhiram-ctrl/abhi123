import React, { useState, useEffect } from 'react';
import './Donations.css';
import { adminAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { 
  FaUser, 
  FaCreditCard, 
  FaMoneyBillWave,
  FaPaypal,
  FaBitcoin,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';

const Donations = () => {
  const { t } = useTranslation();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalAmount: 0,
    monthlyAmount: 0,
    pendingDonations: 0,
    completedDonations: 0
  });
  const [error, setError] = useState(null);

  // Fetch real data from database
  useEffect(() => {
    const loadDonations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch donations and stats
        const [donationsRes, statsRes] = await Promise.all([
          adminAPI.getDonations().catch(err => ({ success: false, data: [], message: err.message })),
          adminAPI.getDonationStats().catch(err => ({ success: false, data: {} }))
        ]);

        // Handle donations
        if (donationsRes.success && Array.isArray(donationsRes.data)) {
          setDonations(donationsRes.data);
        } else {
          console.warn('No donations data received');
          setDonations([]);
        }

        // Handle stats
        if (statsRes.success && statsRes.data) {
          setStats({
            totalAmount: statsRes.data.totalAmount || 0,
            monthlyAmount: statsRes.data.monthlyAmount || 0,
            pendingDonations: statsRes.data.pendingDonations || 0,
            completedDonations: statsRes.data.completedDonations || 0
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Load donations error:', err);
        setError(err.message || 'Failed to load donations');
        setLoading(false);
      }
    };

    loadDonations();
  }, []);

  const getTypeIcon = (type) => {
    switch((type || '').toLowerCase()) {
      case 'credit card': return <FaCreditCard className="type-icon credit-card" />;
      case 'bank transfer': return <FaMoneyBillWave className="type-icon bank-transfer" />;
      case 'paypal': return <FaPaypal className="type-icon paypal" />;
      case 'cryptocurrency': return <FaBitcoin className="type-icon crypto" />;
      default: return <FaCreditCard className="type-icon" />;
    }
  };

  const getStatusIcon = (status) => {
    switch((status || '').toLowerCase()) {
      case 'completed': return <FaCheckCircle className="status-icon completed" />;
      case 'pending': return <FaClock className="status-icon pending" />;
      case 'failed': return <FaTimesCircle className="status-icon failed" />;
      default: return <FaClock className="status-icon" />;
    }
  };

  const formatCurrency = (amount, currency) => {
    if ((currency || '').toLowerCase() === 'btc') {
      return `${parseFloat(amount).toFixed(4)} BTC`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = (donation.donor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (donation.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (donation.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (donation.status || '').toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>{t('Loading donations...')}</p>
      </div>
    );
  }

  return (
    <div className="donations-admin">
      {/* Header */}
      <header className="admin-page-header">
        <div className="header-content">
          <h1 className="page-title">{t('Donation Management')}</h1>
          <p className="page-subtitle">{t('Monitor and manage all donation transactions')}</p>
        </div>
        <div className="header-actions">
          <div className="total-amount">
            <FaChartLine className="amount-icon" />
            <span className="amount-text">{formatCurrency(stats.totalAmount, 'USD')}</span>
            <span className="amount-label">{t('Total Collected')}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="donation-stats-grid">
        <div className="stat-card glass-effect">
          <div className="stat-content">
            <div className="stat-icon-container total">
              <FaMoneyBillWave />
            </div>
            <div className="stat-text">
              <span className="stat-number">{formatCurrency(stats.totalAmount, 'USD')}</span>
              <span className="stat-label">{t('Total Collected')}</span>
            </div>
          </div>
        </div>

        <div className="stat-card glass-effect">
          <div className="stat-content">
            <div className="stat-icon-container monthly">
              <FaCalendarAlt />
            </div>
            <div className="stat-text">
              <span className="stat-number">{formatCurrency(stats.monthlyAmount, 'USD')}</span>
              <span className="stat-label">{t('This Month')}</span>
            </div>
          </div>
        </div>

        <div className="stat-card glass-effect">
          <div className="stat-content">
            <div className="stat-icon-container completed">
              <FaCheckCircle />
            </div>
            <div className="stat-text">
              <span className="stat-number">{stats.completedDonations}</span>
              <span className="stat-label">{t('Completed Count')}</span>
            </div>
          </div>
        </div>

        <div className="stat-card glass-effect">
          <div className="stat-content">
            <div className="stat-icon-container pending">
              <FaClock />
            </div>
            <div className="stat-text">
              <span className="stat-number">{stats.pendingDonations}</span>
              <span className="stat-label">{t('Pending Count')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar glass-effect">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('Search by donor name or email')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('All Status')}</option>
            <option value="completed">{t('Completed')}</option>
            <option value="pending">{t('Pending')}</option>
            <option value="failed">{t('Failed')}</option>
          </select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="donations-table-container glass-effect">
        <table className="donations-table">
          <thead>
            <tr>
              <th>
                <div className="table-header-cell">
                  {t('Donor')}
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Type')}
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Amount')}
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Date')}
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Status')}
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Transaction ID')}
                </div>
              </th>
              <th>
                <div className="table-header-cell">
                  {t('Notes')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDonations.length > 0 ? (
              filteredDonations.map(donation => (
                <tr key={donation.id || donation._id} className="donation-row">
                  <td>
                    <div className="donor-cell">
                      <div className="donor-avatar">
                        <FaUser />
                      </div>
                      <div className="donor-info">
                        <span className="donor-name">{donation.donor || 'Anonymous'}</span>
                        <span className="donor-email">{donation.email || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="type-cell">
                      {getTypeIcon(donation.type)}
                      <span className="type-text">{donation.type || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="amount-cell">
                      <span className="amount-value">{formatCurrency(donation.amount, donation.currency)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <span className="date-text">{formatDate(donation.date)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(donation.status)}
                      <span className={`status-badge ${(donation.status || '').toLowerCase()}`}>
                        {donation.status || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="reference-cell">
                      <span className="reference-text">{donation.reference || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="notes-cell">
                      <span className="notes-text">{donation.notes || '-'}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data-cell">
                  <p className="no-data-message">{t('No donations found')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="table-footer glass-effect">
        <div className="footer-info">
          Showing {filteredDonations.length} of {donations.length} donations
        </div>
        <div className="export-actions">
          <button className="export-btn">
            Export CSV
          </button>
          <button className="export-btn">
            Generate Report
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity glass-effect">
        <h3>Recent Donation Activity</h3>
        <div className="activity-list">
          {donations.slice(0, 3).map((donation, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${(donation.status || '').toLowerCase()}`}>
                {getStatusIcon(donation.status)}
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  <strong>{donation.donor || 'Donor'}</strong> {(donation.status || '').toLowerCase() === 'completed' ? 'donated' : 'initiated a donation of'} {formatCurrency(donation.amount, donation.currency)} via {donation.type || 'payment'}
                </p>
                <span className="activity-time">{formatDate(donation.date)}</span>
              </div>
            </div>
          ))}
          {donations.length === 0 && (
            <div className="no-activity-message">No donation activity yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donations;