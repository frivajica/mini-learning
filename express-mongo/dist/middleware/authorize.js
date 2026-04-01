import { ForbiddenError } from "../utils/AppError.js";
export function authorize(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new ForbiddenError("User not authenticated"));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(", ")}`));
        }
        next();
    };
}
//# sourceMappingURL=authorize.js.map