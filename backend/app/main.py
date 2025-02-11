from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import pizzas, toppings
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pizza Management API")

# Most permissive CORS configuration for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pizzas.router, prefix="/api/pizzas", tags=["pizzas"])
app.include_router(toppings.router, prefix="/api/toppings", tags=["toppings"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Pizza Management API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }