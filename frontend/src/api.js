import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';  

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,  // Increased timeout

});

export const fetchTweets = async () => {
  try {
    const response = await api.get('/tweets');
    return response.data.tweets;  
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
};
