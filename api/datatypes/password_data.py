from pydantic import BaseModel


class PasswordData(BaseModel):
    oldPassword: str
    newPassword: str