import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './KYCAdmin.css';

function KYCAdmin() {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/kyc/pending-reviews');
      setPendingReviews(response.data.pending_reviews);
    } catch (err) {
      setError('Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateKycStatus = async (userId, status) => {
    try {
      setProcessing(true);
      await api.put('/auth/kyc/update-status', null, {
        params: {
          user_id: userId,
          new_status: status,
          reviewer_notes: reviewNotes
        }
      });
      
      // Refresh the list
      await fetchPendingReviews();
      setSelectedUser(null);
      setReviewNotes('');
      alert(`KYC status updated to ${status}`);
    } catch (err) {
      alert('Failed to update KYC status');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_review': return '#d97706';
      case 'incomplete': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="kyc-admin-container">
        <div className="loading">Loading pending KYC reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kyc-admin-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="kyc-admin-container">
      <div className="admin-header">
        <h2>KYC Review Dashboard</h2>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{pendingReviews.length}</span>
            <span className="stat-label">Pending Reviews</span>
          </div>
        </div>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="no-reviews">
          <h3>No Pending Reviews</h3>
          <p>All KYC submissions have been processed.</p>
        </div>
      ) : (
        <div className="reviews-layout">
          <div className="reviews-list">
            <h3>Pending Reviews</h3>
            {pendingReviews.map((user) => (
              <div
                key={user.id}
                className={`review-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-info">
                  <div className="user-name">{user.full_name}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="submission-date">
                    Submitted: {user.kyc_data?.submitted_at ? 
                      formatDate(user.kyc_data.submitted_at) : 'N/A'}
                  </div>
                </div>
                <div className="review-status">
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(user.kyc_status) }}
                  >
                    {user.kyc_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedUser && (
            <div className="review-details">
              <div className="details-header">
                <h3>Review: {selectedUser.full_name}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </button>
              </div>

              <div className="details-content">
                <div className="section">
                  <h4>Personal Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Full Name:</span>
                      <span className="value">
                        {selectedUser.kyc_data?.first_name} {selectedUser.kyc_data?.last_name}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedUser.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Date of Birth:</span>
                      <span className="value">{selectedUser.kyc_data?.date_of_birth}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Nationality:</span>
                      <span className="value">{selectedUser.kyc_data?.nationality}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedUser.kyc_data?.phone_number}</span>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h4>Address Information</h4>
                  <div className="address-info">
                    <p>
                      {selectedUser.kyc_data?.address_line1}<br/>
                      {selectedUser.kyc_data?.address_line2 && (
                        <>{selectedUser.kyc_data.address_line2}<br/></>
                      )}
                      {selectedUser.kyc_data?.city}, {selectedUser.kyc_data?.state} {selectedUser.kyc_data?.postal_code}<br/>
                      {selectedUser.kyc_data?.country}
                    </p>
                  </div>
                </div>

                <div className="section">
                  <h4>Identity Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">PAN Number:</span>
                      <span className="value">{selectedUser.kyc_data?.pan_number || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Aadhaar Number:</span>
                      <span className="value">
                        {selectedUser.kyc_data?.aadhaar_number ? 
                          'XXXX-XXXX-' + selectedUser.kyc_data.aadhaar_number.slice(-4) : 
                          'Not provided'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Government ID Type:</span>
                      <span className="value">{selectedUser.kyc_data?.government_id_type}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Government ID Number:</span>
                      <span className="value">{selectedUser.kyc_data?.government_id_number}</span>
                    </div>
                  </div>
                </div>

                {selectedUser.kyc_data?.documents && selectedUser.kyc_data.documents.length > 0 && (
                  <div className="section">
                    <h4>Uploaded Documents</h4>
                    <div className="documents-grid">
                      {selectedUser.kyc_data.documents.map((doc, index) => (
                        <div key={index} className="document-card">
                          <div className="doc-header">
                            <span className="doc-type">
                              {doc.document_type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="doc-date">
                              {formatDate(doc.uploaded_at)}
                            </span>
                          </div>
                          <div className="doc-filename">{doc.filename}</div>
                          <button className="view-doc-btn">View Document</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="section">
                  <h4>Review Notes</h4>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes here..."
                    className="review-textarea"
                    rows="4"
                  />
                </div>

                <div className="review-actions">
                  <button
                    className="action-btn approve"
                    onClick={() => updateKycStatus(selectedUser.id, 'approved')}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    className="action-btn reject"
                    onClick={() => updateKycStatus(selectedUser.id, 'rejected')}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    className="action-btn incomplete"
                    onClick={() => updateKycStatus(selectedUser.id, 'incomplete')}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Mark Incomplete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default KYCAdmin;
