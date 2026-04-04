from sqlalchemy import Column, Integer, String
from database import Base

class UserRegistration(Base):
    __tablename__ = "UserRegistrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    loginid = Column(String, unique=True, index=True)
    password = Column(String)
    mobile = Column(String, unique=True)
    email = Column(String, unique=True)
    locality = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    status = Column(String, default="waiting")
