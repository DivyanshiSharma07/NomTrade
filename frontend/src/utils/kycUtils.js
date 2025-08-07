// KYC Utility Functions
import CryptoJS from 'crypto-js';

// Validation patterns
export const VALIDATION_PATTERNS = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^[0-9]{12}$/,
  PHONE: /^[+]?[1-9]\d{1,14}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  POSTAL_CODE: /^[0-9]{6}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/
};

// Document type mappings
export const DOCUMENT_TYPES = {
  GOVERNMENT_ID: 'government_id',
  ADDRESS_PROOF: 'address_proof',
  PAN_CARD: 'pan_card',
  BANK_STATEMENT: 'bank_statement',
  INCOME_PROOF: 'income_proof'
};

// KYC Status constants
export const KYC_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  INCOMPLETE: 'incomplete'
};

// Field validation functions
export const validatePAN = (pan) => {
  if (!pan) return { isValid: true, error: null }; // Optional field
  
  const cleanPAN = pan.toUpperCase().trim();
  if (!VALIDATION_PATTERNS.PAN.test(cleanPAN)) {
    return {
      isValid: false,
      error: 'PAN must be in format: ABCDE1234F'
    };
  }
  return { isValid: true, error: null };
};

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return { isValid: true, error: null }; // Optional field
  
  const cleanAadhaar = aadhaar.replace(/\s|-/g, '');
  if (!VALIDATION_PATTERNS.AADHAAR.test(cleanAadhaar)) {
    return {
      isValid: false,
      error: 'Aadhaar must be 12 digits'
    };
  }
  return { isValid: true, error: null };
};

export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const cleanPhone = phone.replace(/\s|-/g, '');
  if (!VALIDATION_PATTERNS.PHONE.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number'
    };
  }
  return { isValid: true, error: null };
};

export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  return { isValid: true, error: null };
};

export const validatePostalCode = (postalCode) => {
  if (!postalCode) {
    return { isValid: false, error: 'Postal code is required' };
  }
  
  if (postalCode.length < 3) {
    return {
      isValid: false,
      error: 'Postal code must be at least 3 characters'
    };
  }
  return { isValid: true, error: null };
};

export const validateIFSC = (ifsc) => {
  if (!ifsc) return { isValid: true, error: null }; // Optional field
  
  const cleanIFSC = ifsc.toUpperCase().trim();
  if (!VALIDATION_PATTERNS.IFSC.test(cleanIFSC)) {
    return {
      isValid: false,
      error: 'IFSC code must be in format: ABCD0123456'
    };
  }
  return { isValid: true, error: null };
};

// Age validation
export const validateAge = (dateOfBirth) => {
  if (!dateOfBirth) {
    return { isValid: false, error: 'Date of birth is required' };
  }
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  
  if (age < 18) {
    return {
      isValid: false,
      error: 'You must be at least 18 years old'
    };
  }
  
  if (age > 100) {
    return {
      isValid: false,
      error: 'Please enter a valid date of birth'
    };
  }
  
  return { isValid: true, error: null };
};

// Comprehensive KYC data validation
export const validateKYCData = (kycData) => {
  const errors = {};
  
  // Required fields validation
  const requiredFields = [
    'first_name', 'last_name', 'date_of_birth', 'nationality',
    'phone_number', 'address_line1', 'city', 'state', 'postal_code',
    'country', 'government_id_type', 'government_id_number'
  ];
  
  requiredFields.forEach(field => {
    if (!kycData[field] || kycData[field].toString().trim() === '') {
      errors[field] = `${field.replace('_', ' ').toUpperCase()} is required`;
    }
  });
  
  // Specific field validations
  const panValidation = validatePAN(kycData.pan_number);
  if (!panValidation.isValid) {
    errors.pan_number = panValidation.error;
  }
  
  const aadhaarValidation = validateAadhaar(kycData.aadhaar_number);
  if (!aadhaarValidation.isValid) {
    errors.aadhaar_number = aadhaarValidation.error;
  }
  
  const phoneValidation = validatePhone(kycData.phone_number);
  if (!phoneValidation.isValid) {
    errors.phone_number = phoneValidation.error;
  }
  
  const ageValidation = validateAge(kycData.date_of_birth);
  if (!ageValidation.isValid) {
    errors.date_of_birth = ageValidation.error;
  }
  
  const postalValidation = validatePostalCode(kycData.postal_code);
  if (!postalValidation.isValid) {
    errors.postal_code = postalValidation.error;
  }
  
  const ifscValidation = validateIFSC(kycData.ifsc_code);
  if (!ifscValidation.isValid) {
    errors.ifsc_code = ifscValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Data encryption/decryption utilities
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-for-dev';

export const encryptSensitiveData = (data) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return data; // Return original data if encryption fails
  }
};

export const decryptSensitiveData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData; // Return original data if decryption fails
  }
};

// Mask sensitive information for display
export const maskSensitiveInfo = (data, field) => {
  if (!data) return 'Not provided';
  
  switch (field) {
    case 'aadhaar_number':
      return data.length > 4 ? `XXXX-XXXX-${data.slice(-4)}` : 'XXXX-XXXX-XXXX';
    case 'pan_number':
      return data.length > 4 ? `XXXXX${data.slice(-4)}` : 'XXXXXXXXXX';
    case 'bank_account_number':
      return data.length > 4 ? `XXXXXXXX${data.slice(-4)}` : 'XXXXXXXXXXXX';
    case 'government_id_number':
      return data.length > 4 ? `XXXXX${data.slice(-4)}` : 'XXXXXXXXXX';
    default:
      return data;
  }
};

// File validation
export const validateKYCDocument = (file, documentType) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    return { isValid: false, error: 'Please select a file' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF, JPG, JPEG, and PNG files are allowed'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }
  
  return { isValid: true, error: null };
};

// Risk assessment scoring
export const calculateRiskScore = (kycData) => {
  let score = 0;
  
  // Age factor
  const age = new Date().getFullYear() - new Date(kycData.date_of_birth).getFullYear();
  if (age < 25) score += 10;
  else if (age > 65) score += 5;
  
  // Income factor
  if (kycData.annual_income) {
    const income = parseFloat(kycData.annual_income);
    if (income < 300000) score += 15; // Low income
    else if (income > 5000000) score += 5; // Very high income
  }
  
  // Employment status
  if (kycData.employment_status === 'unemployed') score += 20;
  else if (kycData.employment_status === 'self_employed') score += 10;
  
  // Investment experience
  if (kycData.investment_experience === 'beginner') score += 15;
  
  // Risk tolerance
  if (kycData.risk_tolerance === 'high') score += 10;
  
  // Document completeness
  const requiredDocs = ['government_id', 'address_proof'];
  const uploadedDocs = kycData.documents?.length || 0;
  if (uploadedDocs < requiredDocs.length) score += 25;
  
  return Math.min(score, 100); // Cap at 100
};

// Status helpers
export const getStatusColor = (status) => {
  switch (status) {
    case KYC_STATUS.APPROVED: return '#059669';
    case KYC_STATUS.UNDER_REVIEW: return '#d97706';
    case KYC_STATUS.REJECTED: return '#dc2626';
    case KYC_STATUS.INCOMPLETE: return '#6b7280';
    default: return '#6b7280';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case KYC_STATUS.APPROVED: return '✅';
    case KYC_STATUS.UNDER_REVIEW: return '⏳';
    case KYC_STATUS.REJECTED: return '❌';
    case KYC_STATUS.INCOMPLETE: return '📝';
    default: return '📋';
  }
};

// Format utilities
export const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
