export type AsyncFunction<T> = () => Promise<T>;
export declare function asyncHandler<T>(fn: (req: any, res: any, next: any) => Promise<T>): (req: any, res: any, next: any) => void;
//# sourceMappingURL=asyncHandler.d.ts.map