from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.schemas import UserIn, KYCSubmission, KYCStatus
from app import crud
from app.database import db
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
import os
import uuid
from pathlib import Path

router = APIRouter()

def fix_objectid(doc):
    if doc and '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

@router.post("/register")
async def register(user_in: UserIn):
    existing = await crud.get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await crud.create_user(user_in)
    user = fix_objectid(user)
    # Create empty portfolio for new user
    await db.portfolios.insert_one({"user_id": user["id"], "holdings": [], "updated_at": None})
    return {"msg": "User registered successfully. Please complete KYC verification.", "user": user}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await crud.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user = fix_objectid(user)
    return {"msg": "Login successful", "user": user}

@router.post("/kyc/submit")
async def submit_kyc(kyc_submission: KYCSubmission, user_id: str):
    """Submit KYC data for verification"""
    try:
        result = await crud.submit_kyc_data(user_id, kyc_submission.kyc_data)
        if result["success"]:
            return {"msg": "KYC data submitted successfully", "status": "under_review"}
        else:
            raise HTTPException(status_code=400, detail=result["errors"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/kyc/status/{user_id}")
async def get_kyc_status(user_id: str):
    """Get KYC status for a user"""
    try:
        kyc_info = await crud.get_user_kyc_status(user_id)
        if kyc_info:
            return kyc_info
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/kyc/upload-document")
async def upload_kyc_document(
    user_id: str,
    document_type: str,
    file: UploadFile = File(...)
):
    """Upload KYC document"""
    try:
        # Validate file type
        allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png'}
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, JPEG, PNG allowed.")
        
        # Create upload directory if it doesn't exist
        upload_dir = Path("uploads/kyc_documents")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"{user_id}_{document_type}_{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update user's KYC data with document info
        await db.users.update_one(
            {"_id": crud.ObjectId(user_id)},
            {
                "$push": {
                    "kyc_data.documents": {
                        "document_type": document_type,
                        "file_path": str(file_path),
                        "filename": file.filename,
                        "uploaded_at": crud.datetime.utcnow(),
                        "verification_status": "pending"
                    }
                }
            }
        )
        
        return {"msg": "Document uploaded successfully", "filename": unique_filename}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/kyc/update-status")
async def update_kyc_status(
    user_id: str,
    new_status: KYCStatus,
    reviewer_notes: str = None
):
    """Update KYC status (Admin endpoint)"""
    try:
        success = await crud.update_kyc_status(user_id, new_status, reviewer_notes)
        if success:
            return {"msg": "KYC status updated successfully", "new_status": new_status}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/kyc/pending-reviews")
async def get_pending_kyc_reviews():
    """Get all pending KYC reviews (Admin endpoint)"""
    try:
        pending_reviews = await db.users.find({
            "kyc_status": {"$in": [KYCStatus.UNDER_REVIEW, KYCStatus.INCOMPLETE]}
        }).to_list(length=None)
        
        # Clean up the response
        for review in pending_reviews:
            review = fix_objectid(review)
            # Remove sensitive data
            if 'hashed_password' in review:
                del review['hashed_password']
        
        return {"pending_reviews": pending_reviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
