import express from "express";

const router = express.Router();

// --- Function: Generate rule-based advice ---
const generateRuleBasedAdvice = (weather, market) => {
  const { condition, temperature, humidity } = weather;
  const { name, price, trend } = market;

  const lowerCondition = condition.toLowerCase();

  // --- Weather-based rules ---
  if (lowerCondition.includes("rain")) {
    return "🌧️ Avoid watering your crops today — rain is expected.";
  }
  if (lowerCondition.includes("cloud") && humidity > 70) {
    return "☁️ Cloudy with high humidity — reduce watering frequency.";
  }
  if (temperature > 35) {
    return "☀️ Hot weather detected — ensure proper irrigation during morning or evening hours.";
  }
  if (temperature < 10) {
    return "❄️ Cold conditions — protect young seedlings from frost.";
  }

  // --- Market-based rules ---
  if (trend > 0) {
    return `📈 ${name} prices are rising — consider selling within the next few days.`;
  }
  if (trend < 0) {
    return `📉 ${name} prices are falling — hold off selling until the market stabilizes.`;
  }

  // --- Humidity-based rules ---
  if (humidity > 80) {
    return "💧 High humidity — monitor for fungal diseases and ensure proper air circulation.";
  }
  if (humidity < 30) {
    return "🌵 Low humidity — consider light irrigation to prevent crop stress.";
  }

  // --- Default fallback ---
  return "🌿 Conditions are stable — continue regular farming practices.";
};

// --- POST Route ---
router.post("/", (req, res) => {
  try {
    const { weather, market } = req.body;

    if (!weather || !market) {
      return res.status(400).json({ message: "Missing weather or market data" });
    }

    const advice = generateRuleBasedAdvice(weather, market);
    res.json({ advice });
  } catch (error) {
    console.error("Advice generation error:", error.message);
    res.status(500).json({ message: "Failed to generate advice" });
  }
});

export default router;
