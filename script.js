const { Rettiwt } = require('rettiwt-api');
const fs = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const API_KEY = process.env.RETTIWT_API_KEY;
const uri = process.env.MONGODB_URI;
const rettiwt = new Rettiwt({ apiKey: API_KEY });

async function run() {
  const maxRetries = 5;  
  const retryDelay = 2000; 
  let client;

  let retries = 0;
  while (retries < maxRetries) {
    try {
      // Connect to MongoDB
      client = new MongoClient(uri);
      await client.connect();
      console.log("Connected to MongoDB");
      break;  // Exit loop once connected successfully
    } catch (err) {
      retries++;
      console.error('Failed to connect to MongoDB (Attempt ${retries}/${maxRetries}):', err);

      if (retries >= maxRetries) {
        console.error("Max retries reached. Exiting...");
        return;  // Exit if max retries reached
      }

      // Wait before retrying
      console.log('Retrying in ${retryDelay / 1000} seconds...');
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  try {
    // Select the database and collection
    const database = client.db("stock_tweets_db");
    const collection = database.collection("stock_tweets");

    // Fetch tweets from Rettiwt
    const res = await rettiwt.tweet.search({
      language: 'en',
minLikes: 50,
includePhrase: 'stock market'
}, 5);

    // Validate response
    if (!res || !Array.isArray(res.list)) {
      console.error('Expected a list of tweets, but got:', res);
      return;
    }

    // Clean the tweet data
    const cleanedData = res.list.map(tweet => ({
      tweet_id: tweet.id,
      created_at: new Date(tweet.createdAt),
      full_text: tweet.fullText,
      tweet_by: {
        username: tweet.tweetBy?.userName,
        full_name: tweet.tweetBy?.fullName,
        profile_image: tweet.tweetBy?.profileImage
      },
      entities: {
        hashtags: tweet.entities?.hashtags || [],
        urls: tweet.entities?.urls || []
      },
      media: tweet.media || [],
      sentiment: null,
      sentiment_analysis: null,
      stock_tickers: null
    }));

    // Save the cleaned data to a JSON file
    fs.writeFileSync('cleaned_tweets.json', JSON.stringify(cleanedData, null, 2));
    console.log('Cleaned tweet data saved to cleaned_tweets.json');

    // Insert the cleaned data into MongoDB
    try {
      const result = await collection.insertMany(cleanedData);
      console.log('Inserted ${result.insertedCount} documents into MongoDB');
    } catch (err) {
      console.error('Error inserting data into MongoDB:', err);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
}

// Run the script
run().catch(console.error);