from passlib.context import CryptContext
from datetime import datetime
from app.database import db
from app.schemas import User, UserIn, KYCSubmission, KYCStatus, KYCData
from bson import ObjectId
import hashlib
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user_by_email(email: str):
    user = await db.users.find_one({"email": email})
    return user

async def create_user(user_in: UserIn):
    hashed_password = pwd_context.hash(user_in.password)
    user = {
        "email": user_in.email,
        "hashed_password": hashed_password,
        "full_name": user_in.full_name,
        "created_at": datetime.utcnow(),
        "kyc_status": KYCStatus.PENDING,
        "is_kyc_verified": False,
        "kyc_data": None
    }
    result = await db.users.insert_one(user)
    user["id"] = str(result.inserted_id)
    return user

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return False
    if not pwd_context.verify(password, user["hashed_password"]):
        return False
    return user

async def submit_kyc_data(user_id: str, kyc_data: KYCData):
    """Submit KYC data for a user"""
    # Validate and sanitize KYC data
    validation_errors = validate_kyc_data(kyc_data)
    if validation_errors:
        return {"success": False, "errors": validation_errors}
    
    # Update user with KYC data
    kyc_dict = kyc_data.dict()
    kyc_dict["submitted_at"] = datetime.utcnow()
    kyc_dict["kyc_status"] = KYCStatus.UNDER_REVIEW
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "kyc_data": kyc_dict,
                "kyc_status": KYCStatus.UNDER_REVIEW
            }
        }
    )
    
    # Log KYC submission for audit trail
    await db.kyc_audit.insert_one({
        "user_id": user_id,
        "action": "kyc_submitted",
        "timestamp": datetime.utcnow(),
        "data": kyc_dict
    })
    
    return {"success": True, "status": "submitted"}

async def get_user_kyc_status(user_id: str):
    """Get KYC status for a user"""
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        return {
            "kyc_status": user.get("kyc_status", KYCStatus.PENDING),
            "is_kyc_verified": user.get("is_kyc_verified", False),
            "kyc_data": user.get("kyc_data")
        }
    return None

def validate_kyc_data(kyc_data: KYCData):
    """Validate KYC data and return list of errors"""
    errors = []
    
    # Validate PAN number format (if provided)
    if kyc_data.pan_number:
        pan_pattern = re.compile(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
        if not pan_pattern.match(kyc_data.pan_number):
            errors.append("Invalid PAN number format")
    
    # Validate phone number
    phone_pattern = re.compile(r'^\+?[1-9]\d{1,14}$')
    if not phone_pattern.match(kyc_data.phone_number.replace(" ", "").replace("-", "")):
        errors.append("Invalid phone number format")
    
    # Validate email format (basic check)
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    # Validate postal code
    if len(kyc_data.postal_code) < 3:
        errors.append("Invalid postal code")
    
    # Check required fields
    required_fields = [
        ('first_name', kyc_data.first_name),
        ('last_name', kyc_data.last_name),
        ('date_of_birth', kyc_data.date_of_birth),
        ('nationality', kyc_data.nationality),
        ('phone_number', kyc_data.phone_number),
        ('address_line1', kyc_data.address_line1),
        ('city', kyc_data.city),
        ('state', kyc_data.state),
        ('country', kyc_data.country),
        ('government_id_type', kyc_data.government_id_type),
        ('government_id_number', kyc_data.government_id_number)
    ]
    
    for field_name, field_value in required_fields:
        if not field_value or field_value.strip() == "":
            errors.append(f"{field_name.replace('_', ' ').title()} is required")
    
    return errors

async def update_kyc_status(user_id: str, status: KYCStatus, reviewer_notes: str = None):
    """Update KYC status (admin function)"""
    update_data = {
        "kyc_status": status,
        "reviewed_at": datetime.utcnow()
    }
    
    if status == KYCStatus.APPROVED:
        update_data["is_kyc_verified"] = True
    
    if reviewer_notes:
        update_data["kyc_data.reviewer_notes"] = reviewer_notes
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    # Log status change
    await db.kyc_audit.insert_one({
        "user_id": user_id,
        "action": "status_updated",
        "new_status": status,
        "reviewer_notes": reviewer_notes,
        "timestamp": datetime.utcnow()
    })
    
    return result.modified_count > 0
