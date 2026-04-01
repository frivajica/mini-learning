import { IOrder } from "../models/index.js";
export declare class OrderService {
    getAll(userId: string, options: {
        page: number;
        limit: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getById(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(userId: string, items: {
        productId: string;
        quantity: number;
    }[]): Promise<import("mongoose").Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateStatus(id: string, status: IOrder["status"]): Promise<import("mongoose").Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
//# sourceMappingURL=orderService.d.ts.map