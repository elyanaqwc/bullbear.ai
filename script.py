from pymongo import MongoClient
from transformers import pipeline
import google.generativeai as genai
import os
from dotenv import load_dotenv
import ast
import pymongo
import time

load_dotenv() 
pipe = pipeline("text-classification", model="elyanaquah/sentiment-analysis")
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def connect_with_retries(max_retries=5):
    retries = 0
    client = None
    try:
        while retries<max_retries:  
            client = MongoClient(os.getenv('MONGODB_URI'), serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            return client
    except pymongo.errors.PyMongoError as e:
            retries += 1
            print(f"MongoDB error: {str(e)}. Retrying {retries}/{max_retries}...")
            time.sleep(5)  
    
    print(f"Failed to connect to MongoDB after {max_retries} attempts.")
    return client

client = connect_with_retries(max_retries=5)

if client:
    db = client.stock_tweets_db
    collection = db.stock_tweets
else:
    print('Could not connect to MongoDB')


def extract_tickers(fulltext):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Extract all valid stock tickers (e.g., NASDAQ, NYSE symbols) mentioned in the following text. 
        Return them as a clean Python list of uppercase strings, with no extra text or code. If no stock tickers
        are found, return an empty string. If there are more than three stock tickers, only return the three most relevant ones.

        **Task:**  
        Text: "{fulltext}"  
        Output:
        """
        
        response = model.generate_content(prompt)
        stock_tickers = ast.literal_eval(response._result.candidates[0].content.parts[0].text.strip())
        return stock_tickers

    except Exception as e:
        print(f"Error occurred while extracting tickers: {e}")
        return []

def calculate_sentiment(headline):
    result = pipe(headline)
    sentiment = result[0]['label']
    confidence_score = result[0]['score']
   
    match(sentiment):
        case 'positive':
            if(confidence_score>=0.97):
                sentiment_analysis = 'Very Bullish'
            else:
                sentiment_analysis = 'Bullish'
        case 'negative':
            if(confidence_score>=0.97):
                sentiment_analysis = 'Very Bearish'
            else:
                sentiment_analysis = 'Bearish'
        case 'neutral':
            sentiment_analysis = 'Neutral'
    return {'Sentiment': sentiment.capitalize(),
            'Sentiment Analysis': sentiment_analysis
            }

pending_tweets = collection.find({'sentiment': None})

for tweet in pending_tweets:
    sentiment_analysis = calculate_sentiment(tweet['full_text'])
    stock_tickers = extract_tickers(tweet['full_text'])

    update_operation = {
        '$set':
        {'sentiment': sentiment_analysis['Sentiment'],
        'sentiment_analysis': sentiment_analysis['Sentiment Analysis'],
        'stock_tickers': stock_tickers
        }
    }
    query_filter = {'_id': tweet['_id'], }
    try:
        result = collection.update_one(query_filter, update_operation)
    except pymongo.errors.WriteError as e:
        print(f"Error with write operation: {str(e)}")
    except pymongo.errors.PyMongoError as e:
        print(f"MongoDB error: {str(e)}")
        

