const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 4000;
const aqiServiceUrl = process.env.AQI_SERVICE_URL || "http://localhost:5000";

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

app.post("/api/aqi", async (req, res) => {
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json({
      error: "Both name and location are required"
    });
  }

  try {
    const serviceResponse = await axios.get(`${aqiServiceUrl}/aqi`, {
      params: { location },
      timeout: 10000
    });

    return res.json({
      name,
      ...serviceResponse.data
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || "Unable to retrieve AQI";
    return res.status(status).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`api-gateway listening on port ${port}`);
});
