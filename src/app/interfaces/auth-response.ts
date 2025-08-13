export interface AuthResponse {
    token: string;
    isSuccess: boolean;
    message: string;
    userId: string;
    refreshToken: string;
}
