# Library Management System V2

A web-based application designed to streamline and manage library operations efficiently.

## Features

- **User Management**: Register, authenticate, and manage user profiles.
- **Book Catalog**: Add, update, delete, and search for books within the library's collection.
- **Borrowing System**: Track book loans, returns, and due dates.
- **Administrative Dashboard**: Monitor library activities and manage resources.
- **Responsive Design**: Accessible on various devices with a user-friendly interface.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python
- **Frameworks**: Flask
- **Database**: SQLite

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AvnishJ29/Library_Management_System_V2.git
   cd Library_Management_System_V2
   ```

2. **Initialize the database**:

   ```bash
   python init_db.py
   ```
3. **Start Redis Server**:
   ```bash
   redis-server
   ```
4. **Start Celery worker and Beat**:
   ```bash
   celery -A main.celery_app worker --loglevel=info
   celery -A main.celery_app beat --loglevel=info
   ```
   
5. **Run the application**:

   ```bash
   python main.py
   ```

6. **Access the application**:

   Open web browser and navigate to `http://localhost:5000/`.
