import * as winston from 'winston';
import * as uuid from 'uuid';
import DailyRotateFile from 'winston-daily-rotate-file';
import LokiTransport from "winston-loki";

// Creating a new winston format to add some required fields to JSON logs
const customJsonFormatFactory = winston.format((info, opts) => {
    info.id = uuid.v4();
    info.SERVICE_NAME = process.env.SERVICE_NAME;
    return info;
});
const customJsonFormat = customJsonFormatFactory();
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    customJsonFormat
)

// Defining console logging format
const consoleLogFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `[${process.env.SERVICE_NAME}] [${level}] ${message}\n------------------------------------------------------------------------`;
});

const logger = winston.createLogger({
    // Custon Format we defined above
    format: logFormat,

    transports: [
        // File transport
        new DailyRotateFile({
            dirname: './logs/',
            level: process.env.FILE_LOG_LEVEL,
            filename: `${process.env.SERVICE_NAME}_%DATE%.log`,
            frequency: '24h',
            datePattern: 'YYYY-MM-DD_HH-mm',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d'
        }),
        
        // Console transport
        new winston.transports.Console({
            level: process.env.CONSOLE_LOG_LEVEL,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                consoleLogFormat
            )
        }),

        // Grafana Loki transport
        // new LokiTransport({
        //     host: process.env.GRAFANA_LOKI_HOST as string,
        //     json: true,
        //     replaceTimestamp: true,
        //     onConnectionError: (err) => { 
        //         // TODO add something meaningful here
        //         // Do nothing for now. 
        //     },
        // })
    ]
});

export default logger;