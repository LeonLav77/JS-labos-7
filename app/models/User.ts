export interface User {
    _id: number;
    name: string | null;
    username: string | null;
    email: string;
    password: string;
    salt: string;
}