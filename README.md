# Pizza Management System

A full-stack web application for managing pizzas and their toppings. Built with React, TypeScript, FastAPI, and PostgreSQL.

## Overview

This application allows pizza store owners to manage their pizza menu by:
- Managing toppings (create, update, delete)
- Creating custom pizzas with selected toppings
- Preventing duplicate pizzas and toppings
- Ensuring data integrity (can't delete toppings used in pizzas)

### Technical Choices

**Frontend:**
- React with TypeScript for type safety and better developer experience
- Material-UI for consistent, responsive design
- Axios for API communication
- React Router for navigation
- Vite for fast development and building

**Backend:**
- FastAPI for high performance and automatic API documentation
- PostgreSQL for reliable data persistence and relationship management
- SQLAlchemy ORM for database operations
- Alembic for database migrations
- Docker for containerization

## Local Development Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL
- Git

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd pizza-management
cd backend
python -m venv venv

2. Set up Python virtual environment:
cd backend
python -m venv venv

3. Activate virtual environment:
# Windows
.\venv\Scripts\activate

# Unix/MacOS
source venv/bin/activate

4. Install dependencies: 
pip install -r requirements.txt

5. Create .env file:
DATABASE_URL=postgresql://postgres:password@localhost:5432/pizza_db

6. Initialize database:
# Create database
psql -U postgres
CREATE DATABASE pizza_db;

# Run migrations
alembic upgrade head

7. Start the backend server: 
uvicorn app.main:app --reload

### Frontend Setup

1. Navigate to frontend directory: 
cd frontend

2. Install dependencies: 
npm install

3. Create .env file:
VITE_API_URL=http://localhost:8000/api

4. Start development server: 
npm run dev

## Running Automated Tests

### Frontend Tests

The frontend uses Vitest and React Testing Library for testing. Tests cover component rendering, user interactions, and service functionality.

1. Navigate to frontend directory:
```bash
cd frontend
2. Run tests:
npm test

### Backend Tests
1. Navigate to frontend directory:
cd backend
2. Run tests:
# Make sure virtual environment is activated
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Unix/MacOS

# Run tests
pytest

