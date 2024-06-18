import { NextFunction, Request, Response } from "express";
import { AnySchema } from "yup";

const validate = (schema: AnySchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validate(req.body, {abortEarly: false});
            next();
        } catch (error: any){
            return res.status(400).json({
                errors: error
            });
        }
    }
}
export default validate;
