import type { LoggerService } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import pino from "pino";
import type { Logger, LoggerOptions } from "pino";

import { RequestContextService } from "../request-context/request-context.service.js";

type PinoLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
type LogMeta = Record<string, unknown>;

const isProduction = process.env.NODE_ENV === "production";

@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger: Logger = pino(createLoggerOptions());

  constructor(private readonly requestContextService: RequestContextService) {}

  write(level: PinoLevel, message: string, meta: LogMeta = {}) {
    const requestContext = this.requestContextService.getStore();

    this.logger[level](
      {
        ...requestContext,
        ...meta
      },
      message
    );
  }

  log(message: unknown, context?: string) {
    this.write("info", stringifyMessage(message), { context });
  }

  error(message: unknown, stack?: string, context?: string) {
    this.write("error", stringifyMessage(message), {
      context,
      err: stack ? { stack } : undefined
    });
  }

  warn(message: unknown, context?: string) {
    this.write("warn", stringifyMessage(message), { context });
  }

  debug(message: unknown, context?: string) {
    this.write("debug", stringifyMessage(message), { context });
  }

  verbose(message: unknown, context?: string) {
    this.write("trace", stringifyMessage(message), { context });
  }

  fatal(message: unknown, context?: string) {
    this.write("fatal", stringifyMessage(message), { context });
  }
}

function createLoggerOptions(): LoggerOptions {
  return {
    level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
    redact: {
      paths: [
        "authorization",
        "cookie",
        "setCookie",
        "xApiKey",
        "password",
        "passwordConfirm",
        "currentPassword",
        "newPassword",
        "token",
        "refreshToken",
        "accessToken",
        "*.authorization",
        "*.cookie",
        "*.setCookie",
        "*.xApiKey",
        "*.password",
        "*.passwordConfirm",
        "*.currentPassword",
        "*.newPassword",
        "*.token",
        "*.refreshToken",
        "*.accessToken"
      ],
      censor: "[REDACTED]"
    },
    transport: isProduction
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
          }
        }
  };
}

function stringifyMessage(message: unknown): string {
  if (typeof message === "string") {
    return message;
  }

  if (message instanceof Error) {
    return message.message;
  }

  return JSON.stringify(message);
}
