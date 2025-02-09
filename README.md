# Financial Tweet Sentiment Analyzer

This project analyzes financial sentiment from tweets using a custom fine-tuned FinBERT model, retrieves stock tickers, and provides a user-friendly interface to explore financial sentiment data. The application is built with a **React** frontend, **FastAPI** backend, and stores data in a **MongoDB** database.

## Tech Stack

- **Frontend**: React (deployed on [Vercel](https://bullbear-ai.vercel.app/))
- **Backend**: FastAPI (hosted on Render)
- **Database**: MongoDB
- **Tweet Retrieval**: JavaScript script using [Rettiwt API](https://github.com/Rishikant181/Rettiwt-API)
- **Sentiment Analysis**: Python script using the fine-tuned [FinBERT](https://huggingface.co/elyanaquah/sentiment-analysis) model
- **Stock Ticker Extraction**: Gemini API
- **Backend Communication**: FastAPI with Axios

## Features

- **Tweet Retrieval**: The backend fetches tweets using the Rettiwt API.
- **Sentiment Analysis**: The collected tweets are analyzed for financial sentiment using a fine-tuned FinBERT model.
- **Stock Ticker Extraction**: Extracts stock tickers from the tweets using the Gemini API for analysis.
- **Data Storage**: All collected tweets and sentiment data are stored in MongoDB.
- **Frontend**: A responsive React app to visualize sentiment trends, stock tickers, and tweet data.
