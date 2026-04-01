export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}
export declare class AuthService {
    register(data: {
        email: string;
        name: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    login(data: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(_refreshToken?: string): Promise<void>;
    private generateTokens;
    private sanitizeUser;
}
//# sourceMappingURL=authService.d.ts.map