const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

function aqiCategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function calculateUsAqiFromPm25(pm25) {
  const breakpoints = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 }
  ];

  const bp = breakpoints.find((b) => pm25 >= b.cLow && pm25 <= b.cHigh);
  if (!bp) return null;

  const aqi =
    ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
  return Math.round(aqi);
}

function findLatestValue(values) {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    const value = values[i];
    if (value !== null && value !== undefined && !Number.isNaN(value)) {
      return value;
    }
  }
  return null;
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "aqi-service" });
});

app.get("/aqi", async (req, res) => {
  const { location } = req.query;

  if (!location || typeof location !== "string") {
    return res.status(400).json({ error: "location query parameter is required" });
  }

  try {
    const geocodeUrl = "https://geocoding-api.open-meteo.com/v1/search";
    const geoResponse = await axios.get(geocodeUrl, {
      params: {
        name: location,
        count: 1,
        language: "en",
        format: "json"
      },
      timeout: 10000
    });

    const firstResult = geoResponse.data?.results?.[0];
    if (!firstResult) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { latitude, longitude, name, country } = firstResult;

    const airQualityUrl = "https://air-quality-api.open-meteo.com/v1/air-quality";
    const airResponse = await axios.get(airQualityUrl, {
      params: {
        latitude,
        longitude,
        hourly: "pm2_5,us_aqi",
        timezone: "auto"
      },
      timeout: 10000
    });

    const usAqiSeries = airResponse.data?.hourly?.us_aqi || [];
    const pm25Series = airResponse.data?.hourly?.pm2_5 || [];

    let aqi = findLatestValue(usAqiSeries);
    let source = "open-meteo us_aqi";

    if (aqi === null) {
      const pm25 = findLatestValue(pm25Series);
      if (pm25 !== null) {
        aqi = calculateUsAqiFromPm25(pm25);
        source = "calculated from pm2_5";
      }
    }

    if (aqi === null) {
      return res.status(502).json({ error: "AQI data unavailable for this location" });
    }

    return res.json({
      locationInput: location,
      resolvedLocation: `${name}, ${country}`,
      coordinates: { latitude, longitude },
      aqi,
      category: aqiCategory(aqi),
      source
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.reason || "Failed to fetch AQI data";
    return res.status(status).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`aqi-service listening on port ${port}`);
});
