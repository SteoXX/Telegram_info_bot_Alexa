const { Telegraf } = require("telegraf");
const axios = require("axios");
const Alexa = require("ask-sdk-core");
require("dotenv").config();

// Create a bot
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Choose the topic to connect
const query = "Artificial Intelligence";

// Function
async function run() {
  try {
    // Fetch weather
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${process.env.LATITUDE}&lon=${process.env.LONGITUDE}&exclude=current,minutely,daily,alerts&appid=${process.env.WEATHER_API_KEY}`
    );
    const weatherData = weatherResponse.data; // Parse and format the weather data

    // Fetch news
    const newsResponse = await axios.get(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_API_KEY}&q=${query}&language=en,it&country=us,gb,fr,de,it`
    );

    const news = newsResponse.data; // Parse and format the news data

    // Format the weather data
    let weatherString = "";
    for (let i = 8; i <= 24; i++) {
      const hourlyData = weatherData.hourly[i];
      const temperature = Math.round(hourlyData.temp - 273.15); // Convert the temperature from kelvin to degrees
      const condition = hourlyData.weather[0].main;
      weatherString += `Hour ${i}:       ${
        temperature + "°C"
      },    ${condition}\n`;
    }

    // Format the news data
    let newsString = "";
    if (news && news.results) {
      for (let i = 0; i < news.results.length; i++) {
        const article = news.results[i];
        const title = article.title;
        const link = article.link;
        newsString += `Title: ${title}\nLink: ${link}\n\n`;
      }
    } else {
      newsString = "No news articles found.";
    }

    // Send the time, news, and weather updates
    await bot.telegram.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      `TIME: ${new Date().toLocaleTimeString()}\n\nWEATHER:\n\n${weatherString}\n\nNEWS:\n\n${newsString}`
    );
  } catch (error) {
    console.error(error);
  }
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    run();
    const speakOutput = "Your skill has been triggered!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler
    // Add other handlers here...
  )
  .lambda();
