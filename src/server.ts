import fs from "fs";
import path from "path";
import https from "https";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import logger from "./utils/logger";
import db from "./models/index";

import { EmailService } from "./services/emailService";

import cameraRoutes from "./routes/cameraRoutes";
import careerRoutes from "./routes/careerRoutes";
import customerRoutes from "./routes/customerRoutes";
import organizationRoutes from "./routes/organizationRoutes";
import contentRoutes from "./routes/contentRoutes";

const NAMESPACE = "Server";
const PORT: string = process.env.PORT || "8080";
const NODE_ENV: string = process.env.NODE_ENV || "development";

const router = express();

EmailService.initializeTemplates();

db.sequelize
  .sync()
  .then(() => {
    logger.info(NAMESPACE, "Database synchronized");
  })
  .catch((err: Error) => {
    logger.error(NAMESPACE, "Error synchronizing database", err);
  });

router.use((req, res, next) => {
  logger.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

  res.on("finish", () => {
    logger.info(
      NAMESPACE,
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });

  next();
});

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

router.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

router.use(compression());
router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(express.static(__dirname + "/public"));

router.use("/api/v1/cameras", cameraRoutes);
router.use("/api/v1/careers", careerRoutes);
router.use("/api/v1/content", contentRoutes);
router.use("/api/v1/customers", customerRoutes);
router.use("/api/v1/organization", organizationRoutes);

const certificatesDirectory = path.join(__dirname, "..", "certificates");

const options = {
  key: fs.readFileSync(path.join(certificatesDirectory, "key.pem")),
  cert: fs.readFileSync(path.join(certificatesDirectory, "cert.pem")),
};

const server = https.createServer(options, router);

server.listen(PORT, () => {
  console.log(`Application running ${NODE_ENV} mode on port ${PORT}..`);
});
