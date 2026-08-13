import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const validateRequest = (schema) => {
  return async (req, _res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => {
          const field = err.path.slice(1).join(".");
          return `${field ? `'${field}': ` : ""}${err.message}`;
        });
        
        next(new AppError(`Validation failed: ${errorMessages.join(", ")}`, 400));
      } else {
        next(error);
      }
    }
  };
};
