export interface LoginData {
    rut: string;
    password: string;
    isTeacher: boolean;
    teamname?: string;
}

export interface LoginResponse {
    token: string;
    rol: string;
    gameId?: number | null;
    teamId?: number | null;
}