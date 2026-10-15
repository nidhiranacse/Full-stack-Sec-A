import helmet from "helmet";
import cors from "cors";

export const securityMiddleware = (app) => {
  app.use(helmet());

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );
};