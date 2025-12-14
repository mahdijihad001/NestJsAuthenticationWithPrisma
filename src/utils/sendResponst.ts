import { Response } from "express";

interface SendResponseOptions<T = any> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T | null;
    metaData?: any | null;
};

export function sendResponse<T>(res: Response, { statusCode, success, message, data = null, metaData = null }: SendResponseOptions<T>) {
    return res.status(statusCode).json({
        success,
        message,
        statusCode,
        data,
        metaData
    });
}