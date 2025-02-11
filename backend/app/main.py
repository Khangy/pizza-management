from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import pizzas, toppings
import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Pizza Management API")

# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173",
    "https://pizza-management-jade.vercel.app"
).split(",")

logger.info(f"Allowed origins: {ALLOWED_ORIGINS}")

# Configure CORS with dynamic origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
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
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    try:
        # Add any health checks here
        return {
            "status": "healthy",
            "environment": os.getenv("ENVIRONMENT", "production"),
            "allowed_origins": ALLOWED_ORIGINS
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}