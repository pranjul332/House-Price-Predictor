import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const ML_BASE_URL = "http://localhost:5001";

/**
 * GET locations
 */
app.get("/api/locations", async (req, res) => {
  try {
    const response = await fetch(`${ML_BASE_URL}/locations`);

    if (!response.ok) {
      const text = await response.text();
      console.error("ML error:", text);
      return res.status(502).json({ error: "ML service error" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Connection error:", err);
    res.status(500).json({ error: "ML service unreachable" });
  }
});

/**
 * POST predict
 */
app.post("/api/predict", async (req, res) => {
  const { location, total_sqft, bath, bhk } = req.body;

  if (!location || !total_sqft || !bath || !bhk) {
    return res.status(400).json({
      success: false,
      error: "Missing fields",
    });
  }

  try {
    const response = await fetch("http://localhost:5001/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, total_sqft, bath, bhk }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({
        success: false,
        error: "ML service error",
      });
    }

    const mlData = await response.json();

    // ✅ FULL RESPONSE (matches UI)
    res.json({
      success: true,
      prediction: mlData.prediction,
      price_per_sqft: (mlData.prediction * 100000) / total_sqft,
      input: {
        location,
        total_sqft,
        bath,
        bhk,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "ML service unreachable",
    });
  }
});



app.get("/api/stats", async (req, res) => {
  try {
    const response = await fetch("http://localhost:5001/stats");

    if (!response.ok) {
      const text = await response.text();
      console.error(text);
      return res.status(502).json({ success: false, error: "ML stats error" });
    }

    const data = await response.json();
    res.json({ success: true, stats: data.stats ?? data });
  } catch (err) {
    res.status(500).json({ success: false, error: "ML service unreachable" });
  }
});


app.listen(4000, () => {
  console.log("✓ Express server running on port 4000");
});
