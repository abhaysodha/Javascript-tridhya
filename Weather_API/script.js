const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const result = document.getElementById("result");

searchBtn.addEventListener("click", () => {
  getWeather(cityInput.value);
});

async function getWeather(city) {
  result.innerHTML = "Loading...";

  try {
    const geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + city;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results) {
      result.innerHTML = "City not found";
      return;
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;
    const name = geoData.results[0].name;

    const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current_weather=true";
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    showWeather(name, weatherData.current_weather);

  } catch (error) {
    result.innerHTML = "Something went wrong";
  }
}

function showWeather(city, weather) {
  result.innerHTML =
    "<h2>" + city + "</h2>" +
    "<p>Temperature: " + weather.temperature + "°C</p>" +
    "<p>Wind Speed: " + weather.windspeed + " km/h</p>";
}