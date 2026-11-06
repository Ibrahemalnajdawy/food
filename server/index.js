import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.FOODTALES_API_KEY;

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || true }));
app.use(express.json());
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 120 }));

const foodTales = axios.create({
  baseURL: "https://api.foodtales.ai/v1",
  timeout: 20000,
  headers: API_KEY ? { "X-Api-Key": API_KEY } : {}
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, apiKeyConfigured: Boolean(API_KEY) });
});

app.get("/api/recipes", async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: "API_KEY_MISSING", message: "أضف FOODTALES_API_KEY في إعدادات السيرفر." });
  try {
    const params = {
      query: String(req.query.query || ""),
      number: Math.min(Math.max(Number(req.query.number) || 24, 1), 50),
      offset: Math.max(Number(req.query.offset) || 0, 0)
    };
    if (req.query.country) params.country = String(req.query.country);
    if (req.query.region) params.macro_region = String(req.query.region);
    if (req.query.subcuisine) params.subcuisine = String(req.query.subcuisine);
    if (req.query.diet) params.diet = String(req.query.diet);

    // Cook search returns cookable recipe variants; dish search can be used when query is blank.
    const path = params.query ? "/recipes/cook-search" : "/recipes/search";
    const { data, headers } = await foodTales.get(path, { params });
    res.json({
      results: data.results || data.recipes || data.meals || [],
      totalResults: data.totalResults ?? data.total ?? null,
      creditsRemaining: headers["x-ft-credits-remaining"] ?? null
    });
  } catch (error) {
    const status = error.response?.status || 502;
    res.status(status).json({
      error: "UPSTREAM_API_ERROR",
      message: error.response?.data?.message || error.response?.data?.detail || "تعذر جلب الوصفات حالياً.",
      upstreamStatus: status
    });
  }
});

app.get("/api/recipes/:id/detail", async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: "API_KEY_MISSING", message: "مفتاح API غير مضبوط على السيرفر." });
  try {
    const { data } = await foodTales.get(`/recipes/${encodeURIComponent(req.params.id)}/detail`);
    res.json(data);
  } catch (error) {
    const status = error.response?.status || 502;
    res.status(status).json({
      error: "DETAIL_ERROR",
      message: error.response?.data?.message || "تفاصيل هذه الوصفة غير متاحة حالياً.",
      upstreamStatus: status
    });
  }
});

app.listen(PORT, () => console.log(`Recipes API running on port ${PORT}`));