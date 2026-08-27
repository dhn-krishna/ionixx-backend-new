export type LogContext = Record<string, unknown>;

const write = (
  level: "info" | "error",
  message: string,
  context?: LogContext,
) => {
  const details = context ? ` ${JSON.stringify(context)}` : "";
  console[level](`[${new Date().toISOString()}] ${message}${details}`);
};

export const logger = {
  info: (message: string, context?: LogContext) =>
    write("info", message, context),
  error: (message: string, context?: LogContext) =>
    write("error", message, context),
};
