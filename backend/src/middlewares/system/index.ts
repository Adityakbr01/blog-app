import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { httpLogger } from "./httpLogger.js";
import { env } from "@/config/env.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later",
});

const middlewares = [


  helmet(),
  cors({
    origin: env.NODE_ENV === "production" ? env.FRONTEND_URL : env.FRONTEND_URL,
    credentials: true,
  }),
  express.json(),
  express.urlencoded({ extended: true }),
  cookieParser(),
  compression(),

  httpLogger,
  ...(env.NODE_ENV === "production" ? [limiter] : []),
];

export default middlewares;
