const auth = require('basic-auth')
import { Response } from "express"
import UserFacade from '../facades/userFacade';

const authMiddleware = async function (req: any, res: Response, next: Function) {
    const credentials = auth(req)
    console.log(credentials)

    try {
        if (credentials && await UserFacade.checkUser(credentials.name, credentials.pass)) {
            console.log('in if')
            const user = await UserFacade.getUser(credentials.name)
            console.log('user', user)
            req.userName = user.userName;
            console.log('req.userName', req.userName)
            return next();
        }
    } catch (err) { }
    console.log("after return next")
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
    res.end('Access denied')
}
export default authMiddleware