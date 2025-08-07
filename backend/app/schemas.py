from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class KYCStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    INCOMPLETE = "incomplete"

class KYCDocumentType(str, Enum):
    GOVERNMENT_ID = "government_id"
    ADDRESS_PROOF = "address_proof"
    PAN_CARD = "pan_card"
    BANK_STATEMENT = "bank_statement"
    INCOME_PROOF = "income_proof"

class KYCDocument(BaseModel):
    document_type: KYCDocumentType
    document_number: str
    file_path: Optional[str] = None
    verification_status: str = "pending"
    uploaded_at: Optional[datetime] = None

class KYCData(BaseModel):
    # Personal Information
    first_name: str
    last_name: str
    date_of_birth: str
    gender: Optional[str] = None
    nationality: str
    
    # Contact Information
    phone_number: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    
    # Identity Information
    pan_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    government_id_type: str  # passport, driver_license, etc.
    government_id_number: str
    
    # Financial Information
    annual_income: Optional[float] = None
    employment_status: Optional[str] = None
    employer_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    
    # Risk Assessment
    investment_experience: Optional[str] = None
    risk_tolerance: Optional[str] = None
    
    # Documents
    documents: List[KYCDocument] = []
    
    # Status and Metadata
    kyc_status: KYCStatus = KYCStatus.PENDING
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewer_notes: Optional[str] = None

class User(BaseModel):
    id: Optional[str]
    email: EmailStr
    hashed_password: str
    full_name: Optional[str]
    created_at: Optional[datetime]
    kyc_data: Optional[KYCData] = None
    kyc_status: KYCStatus = KYCStatus.PENDING
    is_kyc_verified: bool = False

class UserIn(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str]

class KYCSubmission(BaseModel):
    kyc_data: KYCData

class Order(BaseModel):
    id: Optional[str]
    user_id: str
    symbol: str
    side: str  # buy/sell
    quantity: float
    price: float
    status: str  # open, filled, cancelled
    created_at: Optional[datetime]

class Portfolio(BaseModel):
    id: Optional[str]
    user_id: str
    holdings: List[dict]
    updated_at: Optional[datetime]

class Report(BaseModel):
    id: Optional[str]
    user_id: str
    report_type: str
    data: dict
    created_at: Optional[datetime]

class AnalyticsRequest(BaseModel):
    symbol: str
    indicators: List[str]
    start_date: str
    end_date: str

class TestTrade(BaseModel):
    id: Optional[str]
    user_id: str
    symbol: str
    side: str
    quantity: float
    price: float
    status: str
    created_at: Optional[datetime]
