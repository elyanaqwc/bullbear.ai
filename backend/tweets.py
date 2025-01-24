from fastapi import FastAPI, HTTPException
import motor.motor_asyncio
import os
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Optional, List, Annotated
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import pymongo
from datetime import datetime

load_dotenv() 

client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGODB_URI"),
                                                serverSelectionTimeoutMS=5000
                                                )

db = client.get_database('stock_tweets_db')
collection = db.get_collection('stock_tweets')

PyObjectId = Annotated[str, BeforeValidator(str)]

class TweetModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    tweet_id: str
    created_at: datetime
    full_text: str
    tweet_by: dict = {
        "username": str,
        "fullname": str,
        "profile_image": str
    }
    entities: dict = {
        "hashtags": List[str],
        "urls": List[str]
    }
    media: List[dict] = [
        {
            "url": str,
            "type": str
        }
    ]
    sentiment: str
    sentiment_analysis: str  
    stock_tickers: Optional[List[str]] = []
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class TweetCollection(BaseModel):
    tweets: List[TweetModel]


app = FastAPI()

origins = [
    "http://localhost:5173",
    "localhost:5173",
    "https://bullbear-g7x71tgo0-elyanas-projects.vercel.app/",
    "bullbear-g7x71tgo0-elyanas-projects.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/tweets',
         response_model=TweetCollection,
         response_model_by_alias=False
         )
async def display_tweets():

    try: 
        tweets= await collection.find({
        "sentiment": {"$ne": None},
            "sentiment_analysis": {"$ne": None}
        }).sort("created_at", -1).to_list(1000)

        return TweetCollection(tweets= tweets)
    except HTTPException as http_exc:
        raise http_exc  
    
    except pymongo.errors.PyMongoError as e:
        print(f"MongoDB error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
    except Exception as e:
        print(f"Error retrieving tweets: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
        
