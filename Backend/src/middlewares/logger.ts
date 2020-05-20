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
            //format.colorize({ all: true }),
            format.json(),
            format.simple(),
            format.prettyPrint()
            //format.splat()
        ),
    }));
    errorLoggerTransports.push(new winston.transports.Console({
        format: format.combine(
            //format.colorize({ all: true }),
            format.json(),
            //format.errors({ stack: true }), //print stacktrace to console
            format.simple(),
            format.prettyPrint()
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
    colorize: false,
    meta: true,
    requestWhitelist: [...expressWinston.requestWhitelist, "ip"], //ip is formatted ipv6:ipv4
    ignoreRoute: (req) => (req.url === '/graphql')
})

let errorLogger = expressWinston.errorLogger({
    transports: errorLoggerTransports,
    format: format.combine(
        format.json(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),

})

export { requestLogger, errorLogger };

