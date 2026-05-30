import { Request, Response, NextFunction } from "express";

export const headers = () => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    next();
  };
};