import { z } from "zod";
declare const configSchema: z.ZodObject<{
    port: z.ZodDefault<z.ZodNumber>;
    nodeEnv: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    mongoUri: z.ZodString;
    redisUrl: z.ZodString;
    jwt: z.ZodObject<{
        secret: z.ZodString;
        refreshSecret: z.ZodString;
        expiresIn: z.ZodDefault<z.ZodString>;
        refreshExpiresIn: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    }, {
        secret: string;
        refreshSecret: string;
        expiresIn?: string | undefined;
        refreshExpiresIn?: string | undefined;
    }>;
    cors: z.ZodObject<{
        origins: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        origins: string[];
    }, {
        origins?: string[] | undefined;
    }>;
    rateLimit: z.ZodObject<{
        windowMs: z.ZodDefault<z.ZodNumber>;
        max: z.ZodDefault<z.ZodNumber>;
        authMax: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        windowMs: number;
        max: number;
        authMax: number;
    }, {
        windowMs?: number | undefined;
        max?: number | undefined;
        authMax?: number | undefined;
    }>;
    cookie: z.ZodObject<{
        refreshToken: z.ZodObject<{
            name: z.ZodDefault<z.ZodString>;
            maxAgeMs: z.ZodDefault<z.ZodNumber>;
            secure: z.ZodDefault<z.ZodBoolean>;
            sameSite: z.ZodDefault<z.ZodEnum<["strict", "lax", "none"]>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            maxAgeMs: number;
            secure: boolean;
            sameSite: "strict" | "lax" | "none";
        }, {
            name?: string | undefined;
            maxAgeMs?: number | undefined;
            secure?: boolean | undefined;
            sameSite?: "strict" | "lax" | "none" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        refreshToken: {
            name: string;
            maxAgeMs: number;
            secure: boolean;
            sameSite: "strict" | "lax" | "none";
        };
    }, {
        refreshToken: {
            name?: string | undefined;
            maxAgeMs?: number | undefined;
            secure?: boolean | undefined;
            sameSite?: "strict" | "lax" | "none" | undefined;
        };
    }>;
    bcrypt: z.ZodObject<{
        rounds: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        rounds: number;
    }, {
        rounds?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    port: number;
    nodeEnv: "development" | "production" | "test";
    mongoUri: string;
    redisUrl: string;
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origins: string[];
    };
    rateLimit: {
        windowMs: number;
        max: number;
        authMax: number;
    };
    cookie: {
        refreshToken: {
            name: string;
            maxAgeMs: number;
            secure: boolean;
            sameSite: "strict" | "lax" | "none";
        };
    };
    bcrypt: {
        rounds: number;
    };
}, {
    mongoUri: string;
    redisUrl: string;
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn?: string | undefined;
        refreshExpiresIn?: string | undefined;
    };
    cors: {
        origins?: string[] | undefined;
    };
    rateLimit: {
        windowMs?: number | undefined;
        max?: number | undefined;
        authMax?: number | undefined;
    };
    cookie: {
        refreshToken: {
            name?: string | undefined;
            maxAgeMs?: number | undefined;
            secure?: boolean | undefined;
            sameSite?: "strict" | "lax" | "none" | undefined;
        };
    };
    bcrypt: {
        rounds?: number | undefined;
    };
    port?: number | undefined;
    nodeEnv?: "development" | "production" | "test" | undefined;
}>;
export type Config = z.infer<typeof configSchema>;
export declare const config: {
    port: number;
    nodeEnv: "development" | "production" | "test";
    mongoUri: string;
    redisUrl: string;
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origins: string[];
    };
    rateLimit: {
        windowMs: number;
        max: number;
        authMax: number;
    };
    cookie: {
        refreshToken: {
            name: string;
            maxAgeMs: number;
            secure: boolean;
            sameSite: "strict" | "lax" | "none";
        };
    };
    bcrypt: {
        rounds: number;
    };
};
export {};
//# sourceMappingURL=index.d.ts.map