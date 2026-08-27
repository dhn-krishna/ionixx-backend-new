import { RequestHandler } from "express";
import { HTTP_STATUS, HttpStatusCode } from "../constants/status-codes";

declare global {
  namespace Express {
    interface Response {
      success: (body: unknown, statusCode?: HttpStatusCode) => void;
      failure: (message: string, statusCode: HttpStatusCode) => void;
    }
  }
}

export const responseHandler: RequestHandler = (_req, res, next) => {
  res.success = (body, statusCode = HTTP_STATUS.OK) => {
    res.status(statusCode).json(body);
  };

  res.failure = (message, statusCode) => {
    res.status(statusCode).json({ error: { message } });
  };

  next();
};
