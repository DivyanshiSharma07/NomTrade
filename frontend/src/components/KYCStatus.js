import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './KYCStatus.css';

function KYCStatus({ userId }) {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchKycStatus();
  }, [userId]);

  const fetchKycStatus = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/auth/kyc/status/${userId}`);
      setKycStatus(response.data);
    } catch (err) {
      setError('Failed to fetch KYC status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#059669';
      case 'under_review': return '#d97706';
      case 'rejected': return '#dc2626';
      case 'incomplete': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'under_review': return '⏳';
      case 'rejected': return '❌';
      case 'incomplete': return '📝';
      default: return '📋';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'approved':
        return 'Your KYC verification has been approved. You can now access all trading features.';
      case 'under_review':
        return 'Your KYC documents are currently under review. This typically takes 1-3 business days.';
      case 'rejected':
        return 'Your KYC verification was rejected. Please review the feedback and resubmit your documents.';
      case 'incomplete':
        return 'Your KYC verification is incomplete. Please submit all required documents.';
      default:
        return 'Please complete your KYC verification to access all trading features.';
    }
  };

  if (loading) {
    return (
      <div className="kyc-status-container">
        <div className="loading">Loading KYC status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kyc-status-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!kycStatus) {
    return (
      <div className="kyc-status-container">
        <div className="no-kyc">
          <h3>KYC Verification Required</h3>
          <p>Complete your KYC verification to access all trading features.</p>
          <button className="kyc-btn">Start KYC Verification</button>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-status-container">
      <div className="kyc-status-card">
        <div className="status-header">
          <div className="status-icon">
            {getStatusIcon(kycStatus.kyc_status)}
          </div>
          <div className="status-info">
            <h3>KYC Verification Status</h3>
            <span 
              className="status-badge" 
              style={{ backgroundColor: getStatusColor(kycStatus.kyc_status) }}
            >
              {kycStatus.kyc_status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="status-message">
          <p>{getStatusMessage(kycStatus.kyc_status)}</p>
        </div>

        {kycStatus.kyc_data && (
          <div className="kyc-details">
            <h4>Submitted Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Name:</span>
                <span className="value">
                  {kycStatus.kyc_data.first_name} {kycStatus.kyc_data.last_name}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{kycStatus.kyc_data.phone_number}</span>
              </div>
              <div className="detail-item">
                <span className="label">Address:</span>
                <span className="value">
                  {kycStatus.kyc_data.address_line1}, {kycStatus.kyc_data.city}
                </span>
              </div>
              {kycStatus.kyc_data.submitted_at && (
                <div className="detail-item">
                  <span className="label">Submitted:</span>
                  <span className="value">
                    {new Date(kycStatus.kyc_data.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {kycStatus.kyc_data?.documents && kycStatus.kyc_data.documents.length > 0 && (
          <div className="documents-section">
            <h4>Uploaded Documents</h4>
            <div className="documents-list">
              {kycStatus.kyc_data.documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <span className="doc-type">
                    {doc.document_type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`doc-status ${doc.verification_status}`}>
                    {doc.verification_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {kycStatus.kyc_data?.reviewer_notes && (
          <div className="reviewer-notes">
            <h4>Reviewer Notes</h4>
            <p>{kycStatus.kyc_data.reviewer_notes}</p>
          </div>
        )}

        <div className="actions">
          {kycStatus.kyc_status === 'rejected' && (
            <button className="kyc-btn resubmit">Resubmit Documents</button>
          )}
          {kycStatus.kyc_status === 'incomplete' && (
            <button className="kyc-btn complete">Complete KYC</button>
          )}
          <button className="kyc-btn secondary" onClick={fetchKycStatus}>
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default KYCStatus;
