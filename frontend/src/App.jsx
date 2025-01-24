import React, { useEffect, useState } from 'react';
import { fetchTweets } from './api'; 
import './index.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';


const Footer = (()=>{
  return(
    <div className = 'footer'>
     <p className='footertext'>
  Copyright © 2025 Bullbear.ai. All Rights Reserved. <br />
  Disclaimer: The information provided on this website is for general informational purposes only. It is not intended as, nor should it be construed as, financial advice. Users should seek professional guidance before making any financial decisions.
</p>
    </div>
  )
})
const NavBar = (({search, setSearch})=> {
  console.log(search);
  return(
<div className='navbar'>
  <a href = '/' class = 'logo'>
    <img src='src/assets/bullbear.png'></img>
  </a>
 
  <div className = 'searchbar'>
  <FontAwesomeIcon icon={faSearch} style={{color: "#e15241",}} />  
  <input class='search' onChange ={(e)=> setSearch(e.target.value)} type="text" placeholder="Search.."></input>
  </div>
 </div>)
})

const ReadMore = ({ children }) => {
  const text = children;
  const [isReadMore, setIsReadMore] = useState(true);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  const isLongText = text.length > 300; 

  return (
    <p className="text">
      {isReadMore ? text.slice(0, 300) : text}
     
      {isLongText && (
        <span
          onClick={toggleReadMore}
          className="read-or-hide"
          style={{
            color: " #0000EE ",
            cursor: "pointer",

          }}
        >
          {isReadMore ? " Read More" : " Show Less"}
        </span>
      )}
    </p>
  );
};


const TweetList =({search})=> {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const getTweets = async () => {
    try {
      const data = await fetchTweets();
      setTweets(data);
    } catch (err) {
      setError('Error fetching tweets');
    } finally {
      setLoading(false);
    }
  };

  getTweets();

  
  
}, []);  

if (loading) return <p className='loading'>Loading...</p>;
if (error) return <p className='error'>{error}</p>;


return (
  <div className='container'>
    {tweets.filter((tweet) => {
      return search.toLowerCase() === '' 
        ? tweet 
        : tweet.full_text.toLowerCase().includes(search.toLowerCase()) || 
          tweet.tweet_by.full_name.toLowerCase().includes(search.toLowerCase()) ||
          tweet.tweet_by.username.toLowerCase().includes(search.toLowerCase());
    }).length === 0 ? (
      <p className='no-tweets'>No tweets found</p>
    ) : (
      tweets.filter((tweet) => {
        return search.toLowerCase() === '' 
          ? tweet 
          : tweet.full_text.toLowerCase().includes(search.toLowerCase()) || 
            tweet.tweet_by.full_name.toLowerCase().includes(search.toLowerCase()) ||
            tweet.tweet_by.username.toLowerCase().includes(search.toLowerCase());
      }).map((tweet) => {
        let sentimentColor = ''; 
        let analysisColor = '';

        switch (tweet.sentiment) {
          case 'Positive':
            sentimentColor = '#0B5D1E';
            break;
          case 'Negative':
            sentimentColor = '#D64933';
            break;
          case 'Neutral':
            sentimentColor = '#8B6220';
            break;
          default:
            sentimentColor = '#000000'; 
        }

        switch (tweet.sentiment_analysis) {
          case 'Bullish':
            analysisColor = '#018E42';
            break;
          case 'Very Bullish':
            analysisColor = '#96F550';
            break;
          case 'Bearish':
            analysisColor = '#D45113';
            break;
          case 'Very Bearish':
            analysisColor = '#BF1A2F';
            break;
          default:
            analysisColor = '#000000';
        }

        let analysis = '';
        if (tweet.sentiment !== 'Neutral') {
          analysis = tweet.sentiment_analysis;
        }

        function timeSincePosted(postedTimeStr) {
          const postedTime = new Date(postedTimeStr);
          const now = new Date();
          const timeDiff = now - postedTime;

          const minutes = Math.floor(timeDiff / (1000 * 60));
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

          if (minutes < 60) {
              return `${minutes}m`;
          } else if (hours < 24) {
              return `${hours}h`;
          } else {
              return `${days}d`;
          }
        }

        const timestamp = tweet.created_at;
        const time = timeSincePosted(timestamp);

        return (
          <div className='box' key={tweet.tweet_id}>
            <div className='col'>
              <div className='toprow'>
                <img className='user-pfp' loading="lazy" src={tweet.tweet_by.profile_image} alt='User Profile' />
                <p className='name'>{tweet.tweet_by.full_name}</p>
                <p className='username'>@{tweet.tweet_by.username}</p>
                <p className='date'>• {time}</p>
              </div>
              <ReadMore>{tweet.full_text}</ReadMore>
              <div className='bottomrow'>
                <div className='sentiment' style={{ backgroundColor: sentimentColor }}>
                  {tweet.sentiment}
                </div>
                {analysis && (
                  <div className='analysis' style={{ backgroundColor: analysisColor }}>
                    {analysis}
                  </div>
                )}
                {tweet.stock_tickers?.map((ticker, index) => {
                  const colors = [
                    '#45425A', '#654236', '#6C7D47', 
                    '#6E0D25', '#E6ADEC', '#3C6E71', 
                    '#01BAEF', '#AFA2FF'
                  ];
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];

                  return (
                    <div className='ticker' style={{ backgroundColor: randomColor }} key={index}>
                      <span>{ticker}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
);
}

function App() {
  const [search, setSearch] = useState(''); // Lift search state here
  return (
    <>
<NavBar search={search} setSearch={setSearch} />
<div className='wrapper'>
      <TweetList search={search} />
      <Footer></Footer>
      </div>
    </>
   
  )
}

export default App
