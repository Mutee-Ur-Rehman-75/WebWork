import express from "express";
import axios from "axios";

const router = express.Router();

// Get coordinates for a city
const getCoordinates = async (city) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},PK&appid=${process.env.WEATHER_API_KEY}`;
  const response = await axios.get(url);
  return {
    lat: response.data.coord.lat,
    lon: response.data.coord.lon
  };
};

// Get 5-day forecast
router.get("/forecast/:city", async (req, res) => {
  const apiKey = process.env.WEATHER_API_KEY;
  const city = req.params.city;

  try {
    // Use the 5 day / 3 hour forecast API (free tier)
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},PK&units=metric&appid=${apiKey}`;
    const response = await axios.get(url);

    // Process the response to get daily forecasts
    const dailyForecasts = response.data.list.reduce((acc, forecast) => {
      const date = new Date(forecast.dt * 1000);
      const dayKey = date.toISOString().split('T')[0];

      if (!acc[dayKey]) {
        acc[dayKey] = {
          dt: forecast.dt,
          temp_min: forecast.main.temp_min,
          temp_max: forecast.main.temp_max,
          weather: forecast.weather[0]
        };
      } else {
        acc[dayKey].temp_min = Math.min(acc[dayKey].temp_min, forecast.main.temp_min);
        acc[dayKey].temp_max = Math.max(acc[dayKey].temp_max, forecast.main.temp_max);
      }

      return acc;
    }, {});

    // Convert to array and take first 5 days
    const daily = Object.values(dailyForecasts).slice(0, 5);

    res.json({ daily });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({
      message: "Failed to fetch forecast data",
      error: error.message,
      details: error.response?.data
    });
  }
});

router.get("/", async (req, res) => {
  const cities = ["Lahore", "Karachi", "Islamabad", "Quetta", "Peshawar"];
  const apiKey = process.env.WEATHER_API_KEY;

  console.log('Weather API request received');
  console.log('API Key available:', !!apiKey);

  if (!apiKey) {
    console.error('WEATHER_API_KEY is not set in environment variables');
    return res.status(500).json({ message: "Weather API key is not configured" });
  }

  try {
    const data = await Promise.all(
      cities.map(async (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},PK&appid=${apiKey}&units=metric`;
        console.log(`Fetching weather data for ${ city }`);

        try {
          const response = await axios.get(url);
          console.log(`Successfully fetched weather data for ${ city }`);
          return {
            city: city,
            temperature: response.data.main.temp,
            humidity: response.data.main.humidity,
            condition: response.data.weather[0].main,
            icon: response.data.weather[0].icon,
          };
        } catch (cityError) {
          console.error(`Error fetching weather for ${ city }: ${ cityError.message }`);
    return {
      city: city,
      error: cityError.message
    };
  }
      })
    );

const successfulData = data.filter(item => !item.error);
if (successfulData.length === 0) {
  console.error('Failed to fetch weather data for all cities');
  return res.status(500).json({ message: "Failed to fetch weather data for all cities" });
}

console.log('Successfully fetched weather data:', successfulData);
res.json(successfulData);
  } catch (error) {
  console.error('Error in weather route:', error);
  res.status(500).json({
    message: "Failed to fetch weather data",
    error: error.message,
    details: error.response?.data
  });
}
});

export default router;