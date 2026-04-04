from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    name: str
    loginid: str
    mobile: str
    email: str
    locality: str
    address: str
    city: str
    state: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    loginid: str
    password: str

class User(UserBase):
    id: int
    status: str

    class Config:
        from_attributes = True

class PredictionResult(BaseModel):
    result: str
    confidence: float
