from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import User
from app.schemas.all_schemas import Token, UserLogin, UserCreate, UserOut
from app.services.auth_service import verify_password, create_access_token, get_current_user, hash_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
        
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-users")
def get_demo_users():
    """Provides pre-configured demo user accounts for rapid hackathon testing."""
    return [
        {"role": "investigator", "username": "investigator", "password": "investigator123", "name": "Rajesh Sharma", "title": "Senior Claims Investigator"},
        {"role": "reviewer", "username": "reviewer", "password": "reviewer123", "name": "Dr. Amanda Torres", "title": "Chief Review Officer"},
        {"role": "admin", "username": "admin", "password": "admin123", "name": "Sarah Jenkins", "title": "Lead Administrator"}
    ]
