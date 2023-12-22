const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const axios = require("axios");

// Create a bot
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Choose the city to connect
const cityName = "Loranzè";

// Choose the topic to connect
const query = "technology";

// Cron job which runs at 9:00 AM every day
cron.schedule(
  "36 23 * * *",
  () => {
    // Fetch news
    axios
      .get(
        `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_API_KEY}&q=${query}`
      )
      .then((response) => {
        const news = response.data; // Parse and format the news data

        // Fetch weather
        axios
          .get(
            `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.WEATHER_API_KEY}`
          )
          .then((response) => {
            const weather = response.data; // Parse and format the weather data

            // Send the time, news, and weather updates
            bot.telegram.sendMessage(
              process.env.TELEGRAM_CHAT_ID,
              `Time: ${new Date().toLocaleTimeString()}\nWeather: ${weather}\nNews: ${news}`
            );
          });
      });
  },
  {
    scheduled: true,
    timezone: "Europe/Rome",
  }
);
