import { HttpStatusCode } from "../constants/status-codes";

export class AppError extends Error {
  constructor(
    public readonly statusCode: HttpStatusCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
