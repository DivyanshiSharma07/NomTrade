import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AuthForm.css';
import './KYCForm.css';

function Register() {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Basic registration data
  const [basicData, setBasicData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  // KYC data
  const [kycData, setKycData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Indian',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    pan_number: '',
    aadhaar_number: '',
    government_id_type: 'passport',
    government_id_number: '',
    annual_income: '',
    employment_status: 'employed',
    employer_name: '',
    bank_account_number: '',
    bank_name: '',
    ifsc_code: '',
    investment_experience: 'beginner',
    risk_tolerance: 'low'
  });

  // File uploads
  const [documents, setDocuments] = useState({
    government_id: null,
    address_proof: null,
    pan_card: null,
    bank_statement: null
  });

  const handleBasicDataChange = (e) => {
    setBasicData({
      ...basicData,
      [e.target.name]: e.target.value
    });
  };

  const handleKycDataChange = (e) => {
    setKycData({
      ...kycData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (documentType, file) => {
    setDocuments({
      ...documents,
      [documentType]: file
    });
  };

  const validateBasicData = () => {
    if (!basicData.email || !basicData.password || !basicData.fullName) {
      setError('Please fill in all required fields');
      return false;
    }
    if (basicData.password !== basicData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (basicData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const validateKycData = () => {
    const requiredFields = [
      'first_name', 'last_name', 'date_of_birth', 'phone_number',
      'address_line1', 'city', 'state', 'postal_code', 'government_id_number'
    ];
    
    for (let field of requiredFields) {
      if (!kycData[field] || kycData[field].trim() === '') {
        setError(`${field.replace('_', ' ').toUpperCase()} is required`);
        return false;
      }
    }
    
    // Validate phone number
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(kycData.phone_number.replace(/\s|-/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    // Validate PAN if provided
    if (kycData.pan_number) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(kycData.pan_number)) {
        setError('Please enter a valid PAN number (e.g., ABCDE1234F)');
        return false;
      }
    }
    
    return true;
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateBasicData()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        email: basicData.email,
        password: basicData.password,
        full_name: basicData.fullName
      });
      
      setUserId(response.data.user.id);
      setSuccess('Account created successfully! Please complete KYC verification.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateKycData()) return;
    
    setLoading(true);
    try {
      // Submit KYC data
      await api.post('/auth/kyc/submit', {
        kyc_data: kycData
      }, {
        params: { user_id: userId }
      });
      
      // Upload documents if any
      for (const [docType, file] of Object.entries(documents)) {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('user_id', userId);
          formData.append('document_type', docType);
          
          await api.post('/auth/kyc/upload-document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }
      
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'KYC submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleBasicSubmit} className="auth-form">
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={basicData.fullName}
        onChange={handleBasicDataChange}
        className="auth-input"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={basicData.email}
        onChange={handleBasicDataChange}
        className="auth-input"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={basicData.password}
        onChange={handleBasicDataChange}
        className="auth-input"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={basicData.confirmPassword}
        onChange={handleBasicDataChange}
        className="auth-input"
        required
      />
      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleKycSubmit} className="kyc-form">
      <div className="kyc-section">
        <h3>Personal Information</h3>
        <div className="kyc-row">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={kycData.first_name}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={kycData.last_name}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
        </div>
        <div className="kyc-row">
          <input
            type="date"
            name="date_of_birth"
            value={kycData.date_of_birth}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
          <select
            name="gender"
            value={kycData.gender}
            onChange={handleKycDataChange}
            className="kyc-input"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="kyc-row">
          <input
            type="text"
            name="nationality"
            placeholder="Nationality"
            value={kycData.nationality}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
          <input
            type="tel"
            name="phone_number"
            placeholder="Phone Number"
            value={kycData.phone_number}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
        </div>
      </div>

      <div className="kyc-section">
        <h3>Address Information</h3>
        <input
          type="text"
          name="address_line1"
          placeholder="Address Line 1"
          value={kycData.address_line1}
          onChange={handleKycDataChange}
          className="kyc-input full-width"
          required
        />
        <input
          type="text"
          name="address_line2"
          placeholder="Address Line 2 (Optional)"
          value={kycData.address_line2}
          onChange={handleKycDataChange}
          className="kyc-input full-width"
        />
        <div className="kyc-row">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={kycData.city}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={kycData.state}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
        </div>
        <div className="kyc-row">
          <input
            type="text"
            name="postal_code"
            placeholder="Postal Code"
            value={kycData.postal_code}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={kycData.country}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
        </div>
      </div>

      <div className="kyc-section">
        <h3>Identity Information</h3>
        <div className="kyc-row">
          <input
            type="text"
            name="pan_number"
            placeholder="PAN Number (Optional)"
            value={kycData.pan_number}
            onChange={handleKycDataChange}
            className="kyc-input"
          />
          <input
            type="text"
            name="aadhaar_number"
            placeholder="Aadhaar Number (Optional)"
            value={kycData.aadhaar_number}
            onChange={handleKycDataChange}
            className="kyc-input"
          />
        </div>
        <div className="kyc-row">
          <select
            name="government_id_type"
            value={kycData.government_id_type}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          >
            <option value="passport">Passport</option>
            <option value="driver_license">Driver's License</option>
            <option value="voter_id">Voter ID</option>
            <option value="national_id">National ID</option>
          </select>
          <input
            type="text"
            name="government_id_number"
            placeholder="Government ID Number"
            value={kycData.government_id_number}
            onChange={handleKycDataChange}
            className="kyc-input"
            required
          />
        </div>
      </div>

      <div className="kyc-section">
        <h3>Financial Information</h3>
        <div className="kyc-row">
          <input
            type="number"
            name="annual_income"
            placeholder="Annual Income (Optional)"
            value={kycData.annual_income}
            onChange={handleKycDataChange}
            className="kyc-input"
          />
          <select
            name="employment_status"
            value={kycData.employment_status}
            onChange={handleKycDataChange}
            className="kyc-input"
          >
            <option value="employed">Employed</option>
            <option value="self_employed">Self Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        <input
          type="text"
          name="employer_name"
          placeholder="Employer Name (Optional)"
          value={kycData.employer_name}
          onChange={handleKycDataChange}
          className="kyc-input full-width"
        />
      </div>

      <div className="kyc-section">
        <h3>Document Upload</h3>
        <div className="document-upload">
          <label>Government ID:</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('government_id', e.target.files[0])}
            className="file-input"
          />
        </div>
        <div className="document-upload">
          <label>Address Proof:</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('address_proof', e.target.files[0])}
            className="file-input"
          />
        </div>
        {kycData.pan_number && (
          <div className="document-upload">
            <label>PAN Card:</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('pan_card', e.target.files[0])}
              className="file-input"
            />
          </div>
        )}
      </div>

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? 'Submitting KYC...' : 'Submit KYC'}
      </button>
    </form>
  );

  const renderStep3 = () => (
    <div className="kyc-success">
      <div className="success-icon">✅</div>
      <h3>KYC Submitted Successfully!</h3>
      <p>Your KYC information has been submitted for review. You will receive an email notification once the verification is complete.</p>
      <p><strong>Processing Time:</strong> 1-3 business days</p>
      <button onClick={() => navigate('/dashboard')} className="auth-btn">
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <div className="auth-bg">
      <div className={`auth-card ${step === 2 ? 'kyc-card' : ''}`}>
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
        
        <h2 className="auth-title">
          {step === 1 && 'Create Account'}
          {step === 2 && 'KYC Verification'}
          {step === 3 && 'Registration Complete'}
        </h2>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}
        
        {step === 1 && (
          <div className="auth-link">
            <span>Already have an account? </span>
            <button onClick={() => navigate('/')} className="auth-link-btn">Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
