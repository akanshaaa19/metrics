const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_BASE_URL =
  "https://script.google.com/macros/s/AKfycbzQL_J-FsO2wVp0X7Rg_LqiuPV1-955vEDhYK3F-X80dNaQVXG7jm7_UND4l81Jzygb/exec";

// Proxy route with dynamic query params
app.get("/get-metrics", async (req, res) => {
  try {
    // Extract query parameters from request
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(200).json({
        error: "Missing required query parameters: startDate and endDate",
      });
    }

    const finalUrl = `${GOOGLE_SCRIPT_BASE_URL}?startDate=${encodeURIComponent(
      startDate
    )}&endDate=${encodeURIComponent(endDate)}`;

    const response = await axios.get(finalUrl, {
      maxRedirects: 5,
    });

    res.json(response.data);
  } catch (error) {
    res
      .status(200)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
