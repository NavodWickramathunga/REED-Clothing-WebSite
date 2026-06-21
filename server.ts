import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

// ---------------------------------------------------------------------------
// Firebase Admin SDK — Conditional Initialization (v14 Modular API)
// ---------------------------------------------------------------------------
// Attempts to initialize Firebase Admin for server-side ID token verification.
// Gracefully falls back to running without it if credentials are unavailable
// (e.g., local development without a service account key file).
// ---------------------------------------------------------------------------
let firebaseAdminAuth: any = null;
let isFirebaseAdminReady = false;

async function initializeFirebaseAdmin() {
  try {
    // firebase-admin v14 uses modular sub-path exports
    const { initializeApp, getApps, applicationDefault } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");

    // Only initialize if not already initialized
    if (getApps().length === 0) {
      initializeApp({
        credential: applicationDefault(),
      });
    }
    firebaseAdminAuth = getAuth();
    isFirebaseAdminReady = true;
    console.log("✅ Firebase Admin SDK initialized — token verification enabled");
  } catch (err) {
    console.warn(
      "⚠️  Firebase Admin SDK initialization failed. Server-side token verification disabled.",
      "\n   To enable it, set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.",
      "\n   Error:", (err as Error).message
    );
    isFirebaseAdminReady = false;
  }
}

async function startServer() {
  // Initialize Firebase Admin before starting routes
  await initializeFirebaseAdmin();

  const app = express();
  const PORT = 3000;

  // =========================================================================
  // 1. GLOBAL HTTP SECURITY HEADERS (Helmet)
  // =========================================================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://www.googletagmanager.com",
            "https://www.google-analytics.com",
          ],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: [
            "'self'",
            "data:",
            "https://firebasestorage.googleapis.com",
            "https://storage.googleapis.com",
            "https://lh3.googleusercontent.com",
            "https://images.unsplash.com",
            "https://www.googletagmanager.com",
          ],
          connectSrc: [
            "'self'",
            "https://*.googleapis.com",
            "https://*.firebaseio.com",
            "https://*.google-analytics.com",
            "https://www.googletagmanager.com",
            "https://firestore.googleapis.com",
            "wss://*.firebaseio.com",
          ],
          frameSrc: ["https://www.googletagmanager.com"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Needed for Firebase/GTM resources
      hsts: {
        maxAge: 63072000, // 2 years
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // =========================================================================
  // 2. JSON BODY SIZE LIMIT — Prevent storage payload exploitation
  // =========================================================================
  app.use(express.json({ limit: "2mb" }));

  // =========================================================================
  // 3. RATE LIMITING — Prevent API resource abuse
  // =========================================================================
  const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 100,                  // Max 100 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Rate limit exceeded. Please try again later." },
  });

  const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1-hour window
    max: 15,                   // Max 15 AI generation requests per IP per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "AI generation rate limit reached. Please wait before trying again." },
  });

  app.use("/api/", globalApiLimiter);

  // =========================================================================
  // 4. ADMIN TOKEN VERIFICATION MIDDLEWARE
  // =========================================================================
  const ADMIN_EMAILS = [
    "admin@reed.lk",
    "temp-admin@reed.lk",
    "navodwickramathunga@gmail.com",
  ];

  async function authenticateAdminSession(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    // If Firebase Admin is not available, fall back to allowing requests
    // (for local development without service account credentials)
    if (!isFirebaseAdminReady || !firebaseAdminAuth) {
      console.warn("⚠️  Admin auth bypassed — Firebase Admin SDK not initialized");
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Authentication token missing.",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken);

      // Verify email is verified and matches admin whitelist
      if (
        decodedToken.email_verified &&
        ADMIN_EMAILS.includes(decodedToken.email?.toLowerCase() || "")
      ) {
        (req as any).user = decodedToken;
        return next();
      }

      return res.status(403).json({
        success: false,
        error: "Access forbidden. Insufficient administrative privileges.",
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Session expired or token invalid. Please re-authenticate.",
      });
    }
  }

  // =========================================================================
  // 5. API ROUTES
  // =========================================================================

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Initialize Gemini client utility
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required to run AI integrations"
      );
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Secured Gemini API endpoint — rate-limited + admin-authenticated
  app.post(
    "/api/gemini/generate",
    aiGenerationLimiter,
    authenticateAdminSession,
    async (req, res) => {
      const { prompt } = req.body;

      // Input validation
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt must be a non-empty string." });
      }

      if (prompt.length > 4000) {
        return res.status(400).json({ error: "Prompt exceeds maximum length of 4000 characters." });
      }

      const startTime = Date.now();
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        const duration = Date.now() - startTime;
        const textOutput = response.text || "";

        res.json({
          success: true,
          text: textOutput,
          duration,
          status: "Success",
        });
      } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error("Gemini API Error:", error);

        // Sanitize error output — never leak internal details in production
        const safeErrorMessage =
          process.env.NODE_ENV === "production"
            ? "AI generation failed. Please try again later."
            : error.message || String(error);

        res.status(500).json({
          success: false,
          error: safeErrorMessage,
          duration,
          status: "Error",
        });
      }
    }
  );

  // =========================================================================
  // 6. VITE DEV SERVER / PRODUCTION STATIC SERVING
  // =========================================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔒 Secured REED Server running on http://localhost:${PORT}`);
  });
}

startServer();
