const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const axios = require("axios");

// Create a bot
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Cron job which runs at 9:00 AM every day
cron.schedule(
  "3 22 * * *",
  () => {
    // Fetch news
    axios.get("NEWS_API_URL").then((response) => {
      const news = response.data; // Parse and format the news data

      // Fetch weather
      axios.get(process.env.WEATHER_API_URL).then((response) => {
        const weather = response.data; // Parse and format the weather data

        // Send the time, news, and weather updates
        bot.telegram.sendMessage(
          process.env.TELEGRAM_CHAT_ID,
          `Time: ${new Date().toLocaleTimeString()}\nNews: ${news}\nWeather: ${weather}`
        );
      });
    });
  },
  {
    scheduled: true,
    timezone: "Europe/Rome",
  }
);
