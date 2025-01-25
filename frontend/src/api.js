import axios from 'axios';

const API_URL = 'https://bullbear-ai.onrender.com';  

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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
