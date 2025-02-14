const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_BASE_URL = process.env.GOOGLE_SCRIPT_API || "";

const resumeFlow = async (startDate, endDate, contact, flowId) => {
  try {
    if (!startDate || !endDate) {
      console.log({
        error: "Missing required query parameters: startDate and endDate",
      });
    }
    const token = await getAuthToken();
    const finalUrl = `${GOOGLE_SCRIPT_BASE_URL}?startDate=${encodeURIComponent(
      startDate
    )}&endDate=${encodeURIComponent(endDate)}`;

    const response = await axios.get(finalUrl, {
      maxRedirects: 5,
    });

    const data = JSON.stringify({
      query: `mutation resumeContactFlow($flowId: ID!, $contactId: ID!, $result: Json!) {
                resumeContactFlow(flowId: $flowId, contactId: $contactId, result: $result) {
                  success
                  errors {
                      key
                      message
                  }
                }
              }`,
      variables: {
        flowId: flowId,
        contactId: contact?.id,
        result: JSON.stringify({
          metrics: response?.data,
        }),
      },
    });

    let config = {
      url: process.env.GLIFIC_URL,
      headers: {
        authorization: token,
        "Content-Type": "application/json",
      },
    };

    if (token) {
      const data2 = await axios.post(config?.url, data, {
        headers: config?.headers,
      });
    }
  } catch (error) {
    console.log({ error: "Failed to fetch data", details: error.message });
  }
};

app.post("/get-metrics", async (req, res) => {
  const { startDate, endDate, contact, flowId } = req.body;
  res.json({
    success: true,
  });

  resumeFlow(startDate, endDate, contact, flowId);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const getAuthToken = async () => {
  try {
    const glific_backend_url = process.env.GLIFIC_URL || "";
    const response = await axios.post(`${glific_backend_url}/v1/session`, {
      user: {
        phone: process.env.PHONE,
        password: process.env.PASSWORD,
      },
    });
    return response.data.data.access_token;
  } catch (error) {
    console.log("Error in getting token", error);
  }
};
