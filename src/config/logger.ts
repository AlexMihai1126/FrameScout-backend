import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const logDir = path.resolve(process.cwd(), 'logs');
const combinedLog = process.env.COMBINED_LOG  || 'combined.log';
const errorLog    = process.env.ERR_LOG       || 'error.log';

fs.mkdirSync(logDir, { recursive: true });

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, combinedLog) }),
    new transports.File({ filename: path.join(logDir, errorLog), level: 'error' }),
    // new transports.Console()
  ],
});

export default logger;
