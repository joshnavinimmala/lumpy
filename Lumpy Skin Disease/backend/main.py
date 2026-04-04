from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import os
import shutil
from typing import List

import models, schemas, database, utils
from database import engine, get_db

# Create the backend/uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Lumpy Skin Disease Detection API")

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.UserRegistration).filter(
        (models.UserRegistration.loginid == user.loginid) | 
        (models.UserRegistration.email == user.email) |
        (models.UserRegistration.mobile == user.mobile)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email, Login ID or Mobile already exists"
        )
    
    new_user = models.UserRegistration(
        name=user.name,
        loginid=user.loginid,
        password=user.password,
        mobile=user.mobile,
        email=user.email,
        locality=user.locality,
        address=user.address,
        city=user.city,
        state=user.state,
        status="waiting"  # Default status matching Django
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.User)
def login_user(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.UserRegistration).filter(
        models.UserRegistration.loginid == user_login.loginid,
        models.UserRegistration.password == user_login.password
    ).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Login ID or password"
        )
    
    if db_user.status != "activated":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not activated yet"
        )
    
    return db_user

@app.post("/predict", response_model=schemas.PredictionResult)
async def upload_and_predict(file: UploadFile = File(...)):
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        label, confidence = utils.predict_image(file_path)
        return {"result": label, "confidence": confidence}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        # Optionally clean up the file
        # os.remove(file_path)
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
