const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();

// Create a bot
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Choose the city to connect
const cityName = "Loranzè";

// Choose the topic to connect
const query = "Artificial Intelligence";

// Cron job which runs at 9:00 AM every day
cron.schedule(
  "32 15 * * *",
  async () => {
    try {
      // Fetch weather
      const weatherResponse = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.WEATHER_API_KEY}`
      );
      const weather = weatherResponse.data; // Parse and format the weather data

      // Fetch news
      const newsResponse = await axios.get(
        `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_API_KEY}&q=${query}&language=en,it&country=us,gb,fr,de,it`
      );

      const news = newsResponse.data; // Parse and format the news data

      // Format the weather data
      const temperature = Math.round(weather.main.temp - 273.15); // Convert the temperature from kelvin to degrees
      const condition = weather.weather[0].main;

      // Format the news data
      let newsString = "";
      if (news && news.results) {
        for (let i = 0; i < news.results.length; i++) {
          const article = news.results[i];
          const title = article.title;
          const link = article.link;
          newsString += `*Title*: ${title}\n*Link*: ${link}\n\n`;
        }
      } else {
        newsString = "No news articles found.";
      }

      // Send the time, news, and weather updates
      await bot.telegram.sendMessage(
        process.env.TELEGRAM_CHAT_ID,
        `*TIME*: ${new Date().toLocaleTimeString()}\n\n*WEATHER*: ${
          temperature + "°C"
        }, ${condition}\n\n*NEWS*:\n\n${newsString}`,
        { parse_mode: "Markdown" } // Markdown to make the text bold
      );
    } catch (error) {
      console.error(error);
    }
  },
  {
    scheduled: true,
    timezone: "Europe/Rome",
  }
);
