import React, { useState } from 'react';
import './DonatePage.css';
import apiClient from '../services/apiClient';

const DonatePage = () => {
	const [donationForm, setDonationForm] = useState({
		donor: '',
		email: '',
		phone: '',
		amount: 50,
		type: 'credit-card',
		message: '',
		anonymous: false
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);

	const handleQuickAmount = (amount) => {
		setDonationForm({ ...donationForm, amount });
	};

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setDonationForm({
			...donationForm,
			[name]: type === 'checkbox' ? checked : value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			setError(null);
			
			// Validate form
			if (!donationForm.donor || !donationForm.email || !donationForm.amount) {
				setError('Please fill in all required fields');
				setLoading(false);
				return;
			}

			// Submit donation
			const response = await apiClient.post('/donations', donationForm);
			
			if (response.data.success) {
				setSuccess(true);
				setDonationForm({
					donor: '',
					email: '',
					phone: '',
					amount: 50,
					type: 'credit-card',
					message: '',
					anonymous: false
				});
				setTimeout(() => setSuccess(false), 3000);
			} else {
				setError(response.data.message || 'Failed to process donation');
			}
		} catch (err) {
			console.error('Donation error:', err);
			setError(err.response?.data?.message || 'An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="donate-page">
			<div className="donate-hero">
				<h1>Support Disaster Relief</h1>
				<p>Your contribution helps provide emergency aid, shelter, and supplies to affected families.</p>
			</div>

			<div className="donate-content">
				{success && (
					<div className="success-message">
						✓ Thank you for your donation! We appreciate your support.
					</div>
				)}

				{error && (
					<div className="error-message">
						✗ {error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="donate-form">
					<section className="donate-card">
						<h2>Make a Donation</h2>
						
						<div className="form-group">
							<label>Full Name *</label>
							<input 
								type="text" 
								name="donor"
								value={donationForm.donor}
								onChange={handleInputChange}
								placeholder="Your name"
								required
							/>
						</div>

						<div className="form-group">
							<label>Email *</label>
							<input 
								type="email" 
								name="email"
								value={donationForm.email}
								onChange={handleInputChange}
								placeholder="your@email.com"
								required
							/>
						</div>

						<div className="form-group">
							<label>Phone Number</label>
							<input 
								type="tel" 
								name="phone"
								value={donationForm.phone}
								onChange={handleInputChange}
								placeholder="+1 (555) 123-4567"
							/>
						</div>

						<div className="form-group">
							<label>Donation Type *</label>
							<select 
								name="type"
								value={donationForm.type}
								onChange={handleInputChange}
								required
							>
								<option value="credit-card">Credit Card</option>
								<option value="bank-transfer">Bank Transfer</option>
								<option value="paypal">PayPal</option>
								<option value="resources">Resources/Items</option>
							</select>
						</div>

						<div className="form-group">
							<label>Quick Amounts</label>
							<div className="donate-amounts">
								{[25, 50, 100, 250, 500].map(amount => (
									<button 
										key={amount} 
										type="button"
										className={`amount-btn ${donationForm.amount === amount ? 'active' : ''}`}
										onClick={() => handleQuickAmount(amount)}
									>
										${amount}
									</button>
								))}
							</div>
						</div>

						<div className="form-group">
							<label>Custom Amount ($) *</label>
							<input 
								type="number" 
								name="amount"
								value={donationForm.amount}
								onChange={handleInputChange}
								min="1"
								placeholder="Enter amount"
								required
							/>
						</div>

						<div className="form-group">
							<label>Message (Optional)</label>
							<textarea 
								name="message"
								value={donationForm.message}
								onChange={handleInputChange}
								placeholder="Leave a message of support..."
								rows="4"
							/>
						</div>

						<div className="form-group checkbox">
							<label>
								<input 
									type="checkbox" 
									name="anonymous"
									checked={donationForm.anonymous}
									onChange={handleInputChange}
								/>
								Make this donation anonymous
							</label>
						</div>

						<button type="submit" className="primary-btn" disabled={loading}>
							{loading ? 'Processing...' : 'Complete Donation'}
						</button>
					</section>
				</form>

				<section className="donate-card">
					<h2>Why Donate?</h2>
					<ul className="donate-list">
						<li>✓ Rapid response teams and medical supplies</li>
						<li>✓ Food, water, and essential relief kits</li>
						<li>✓ Temporary shelters for displaced families</li>
						<li>✓ Volunteer training and coordination</li>
						<li>✓ Community disaster preparedness programs</li>
					</ul>
				</section>

				<section className="donate-card">
					<h2>Donation Impact</h2>
					<div className="impact-grid">
						<div className="impact-item">
							<h3>$25</h3>
							<p>Provides emergency first aid kit</p>
						</div>
						<div className="impact-item">
							<h3>$50</h3>
							<p>Feeds a family of 4 for 2 days</p>
						</div>
						<div className="impact-item">
							<h3>$100</h3>
							<p>Provides temporary shelter supplies</p>
						</div>
						<div className="impact-item">
							<h3>$250+</h3>
							<p>Supports rescue operations</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default DonatePage;
