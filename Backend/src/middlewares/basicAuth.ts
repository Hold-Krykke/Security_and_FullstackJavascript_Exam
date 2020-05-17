//const http = require('http')
const auth = require('basic-auth')
//const compare = require('tsscmp')
import { Response } from "express"
import UserFacade from '../facades/userFacade';

const authMiddleware = async function (req: any, res: Response, next: Function) {
    const credentials = auth(req)

    try {
        if (credentials && await UserFacade.checkUser(credentials.name, credentials.pass)) {
            const user = await UserFacade.getUser(credentials.name)
            req.userName = user.userName;
            return next();
        }
    } catch (err) { }
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
    res.end('Access denied')
}
export default authMiddleware