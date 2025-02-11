from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import pizzas, toppings
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pizza Management API")

# Explicitly list all allowed origins
ALLOWED_ORIGINS = [
    "https://pizza-management-jade.vercel.app",  # Your Vercel domain
    "https://pizza-management-jade.vercel.app/",  # With trailing slash
    "http://localhost:3000",
    "http://localhost:5173"
]

# Configure CORS with explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(pizzas.router, prefix="/api/pizzas", tags=["pizzas"])
app.include_router(toppings.router, prefix="/api/toppings", tags=["toppings"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Pizza Management API",
        "docs": "/docs",
        "version": "1.0.0",
        "allowed_origins": ALLOWED_ORIGINS  # Add this to debug
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "allowed_origins": ALLOWED_ORIGINS,  # Add this to debug
        "environment": os.getenv("ENVIRONMENT", "production")
    }