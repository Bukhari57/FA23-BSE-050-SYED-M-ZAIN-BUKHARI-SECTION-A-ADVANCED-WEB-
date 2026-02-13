const http = require('http');
const fs = require('fs');
const axios = require('axios');

// Multan coordinates
const API_URL =
"https://api.open-meteo.com/v1/forecast?latitude=30.1575&longitude=71.5249&current_weather=true";

// Function to fetch and save weather
async function fetchWeather() {
  try {
    console.log("Fetching weather...");

    const response = await axios.get(API_URL);

    const weather = response.data.current_weather;

    const data =
`Temperature: ${weather.temperature} °C
Wind Speed: ${weather.windspeed} km/h
Time: ${weather.time}
`;

    fs.writeFileSync("weather_log.txt", data);
    console.log("Weather saved to file");

  } catch (err) {
    console.log("Error fetching weather:", err.message);
  }
}

// Run once when program starts
fetchWeather();


// Create HTTP server
const server = http.createServer((req, res) => {

  if (req.url === "/") {

    try {
      const data = fs.readFileSync("weather_log.txt", "utf8");
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(data);
    } catch {
      res.end("Weather not available yet.");
    }

  }

});

server.listen(3000, () => {
  console.log("Server running → http://localhost:3000");
});