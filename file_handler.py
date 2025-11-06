import os
from datetime import datetime
import shutil
import re
from fastapi import UploadFile

UPLOAD_DIRECTORY = "uploads"

def sanitize_filename(filename: str) -> str:
    """Remove special characters and replace spaces with underscores."""
    return re.sub(r'[^a-zA-Z0-9_.-]', '', filename.replace(' ', '_'))

def save_upload_file(upload_file: UploadFile) -> str:
    """Saves an uploaded file, renaming it based on date and original name."""
    if not upload_file or upload_file.filename == '':
        return None

    # Create the uploads directory if it doesn't exist
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

    # Sanitize filename
    sanitized_filename = sanitize_filename(upload_file.filename)
    
    # Create new filename with date prefix
    date_str = datetime.now().strftime("%Y-%m-%d")
    name, extension = os.path.splitext(sanitized_filename)
    new_filename = f"{date_str}-{name}{extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, new_filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path
