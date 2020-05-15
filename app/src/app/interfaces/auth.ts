export interface LoginData {
    rut: string;
    password: string;
    isTeacher: boolean;
    teamname?: string;
}

export interface LoginResponse {
    token: string;
    rol?: string;
    userName?: string;
    teamName?: string | null;
}