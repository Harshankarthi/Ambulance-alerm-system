import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Smart Ambulance Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AmbulanceUpdate(BaseModel):
    id: str
    lat: float
    lng: float
    speed: float
    status: str

class SignalUpdate(BaseModel):
    id: str
    status: str

@app.get("/")
async def root():
    return {"message": "Smart Ambulance Backend is running"}

@app.post("/ambulance/update")
async def update_ambulance(data: AmbulanceUpdate):
    try:
        response = supabase.table("ambulances").upsert({
            "id": data.id,
            "lat": data.lat,
            "lng": data.lng,
            "speed": data.speed,
            "status": data.status,
            "updated_at": "now()"
        }).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/signals/update")
async def update_signal(data: SignalUpdate):
    try:
        if data.status not in ["red", "green", "amber"]:
            raise HTTPException(status_code=400, detail="Invalid signal status")
            
        response = supabase.table("signals").update({
            "status": data.status,
            "updated_at": "now()"
        }).eq("id", data.id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
