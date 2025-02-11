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

const resumeFlow = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      console.log({
        error: "Missing required query parameters: startDate and endDate",
      });
    }

    const finalUrl = `${GOOGLE_SCRIPT_BASE_URL}?startDate=${encodeURIComponent(
      startDate
    )}&endDate=${encodeURIComponent(endDate)}`;

    const response = await axios.get(finalUrl, {
      maxRedirects: 5,
    });

    const graphqlResponse = await axios.post(
      "https://api.prod.glific.com/api",
      {
        query: `
          mutation resumeContactFlow($flowId: ID!, $contactId: ID!, $result: Json!) {
            resumeContactFlow(flowId: $flowId, contactId: $contactId, result: $result) {
              success
              errors {
                key
                message
              }
            }
          }
        `,
        variables: {
          flowId: "26171",
          contactId: "1702210",
          result: response.data,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Replace with your actual access token
        },
      }
    );
    console.log(response.data, graphqlResponse);
  } catch (error) {
    console.log({ error: "Failed to fetch data", details: error.message });
  }
};

// Proxy route with dynamic query params
app.get("/get-metrics", async (req, res) => {
  const { startDate, endDate } = req.query;
  resumeFlow(startDate, endDate);

  res.json({
    success: true,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
