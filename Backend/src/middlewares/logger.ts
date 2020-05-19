import winston, { format } from "winston";
import * as expressWinston from "express-winston";
import path from "path"

let requestLoggerTransports: Array<any> = [
    //always save to file
    new winston.transports.File({ filename: path.join(process.cwd(), "logs", "requests.log") })
]
let errorLoggerTransports: Array<any> = [
    //always save to file
    new winston.transports.File({ filename: path.join(process.cwd(), "logs", "error.log") })
]
if (process.env.NODE_ENV !== 'production') {
    //if dev, also log to console
    requestLoggerTransports.push(new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            format.json(),
            format.simple(),
            //format.splat()
        ),
    }));
    errorLoggerTransports.push(new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            format.json(),
            format.errors({ stack: true }), //print stacktrace to console
            format.simple()
        )
    }));
}

let requestLogger = expressWinston.logger({
    transports: requestLoggerTransports,
    format: format.combine(
        format.json(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    ),
    expressFormat: true, //may overwrite some of the above
    colorize: true, //may be overwritten
    baseMeta: { request: "HTTP {{req.method}} {{res.responseTime}}ms {{req.url}} {{req.ip}}" },
    meta:true,

})

let errorLogger = expressWinston.errorLogger({
    transports: errorLoggerTransports,
    format: format.combine(
        format.json(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
})

export { requestLogger, errorLogger };

