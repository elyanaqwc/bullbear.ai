import axios from 'axios';

const API_URL = 'https://bullbear-ai.onrender.com';  

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});


const interval = 30000;

function reloadWebsite() {
  axios.get(API_URL)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}


setInterval(reloadWebsite, interval);

export const fetchTweets = async () => {
  try {
    const response = await api.get('/tweets');
    return response.data.tweets;  
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw error;
  }
};
