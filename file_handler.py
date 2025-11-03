import os
from datetime import datetime
import shutil
import re
from fastapi import UploadFile

UPLOAD_DIRECTORY = "uploads"

def sanitize_filename(filename: str) -> str:
    """Remove special characters and replace spaces with underscores."""
    return re.sub(r'[^a-zA-Z0-9_.-]', '', filename.replace(' ', '_'))

def save_upload_file(upload_file: UploadFile, titulo: str) -> str:
    """Saves an uploaded file, renaming it based on date and title."""
    if not upload_file or upload_file.filename == '':
        return None

    # Create the uploads directory if it doesn't exist
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

    # Sanitize title and get file extension
    sanitized_title = sanitize_filename(titulo)
    _, extension = os.path.splitext(upload_file.filename)
    
    # Create new filename
    date_str = datetime.now().strftime("%Y-%m-%d")
    new_filename = f"{date_str}-{sanitized_title}{extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, new_filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path
