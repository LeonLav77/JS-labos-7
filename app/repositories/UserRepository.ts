import { createPool, Pool, RowDataPacket } from 'mysql2/promise';
import { User } from '../models/User';
import dotenv from 'dotenv';

class UserRepository {
    private db: Pool;

    constructor() {
        dotenv.config();

        this.db = createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
    }

    async getAllUsers(): Promise<User[]> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT * FROM users');
        return rows as User[];
    }

    async createNewUser(
        name: string,
        email: string,
        password: string,
        salt: string,
        role: number = 0
    ): Promise<User> {
        const [result] = await this.db.execute(
            `INSERT INTO users (name, email, password, salt) VALUES (?, ?, ?, ?)`,
            [name, email, password, salt]
        );
        const insertId = (result as any).insertId;

        return this.getUserById(insertId.toString()) as Promise<User>;
    }

    async getUserById(_id: string): Promise<User | null> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT * FROM users WHERE _id = ?', [_id]);
        return rows.length > 0 ? (rows[0] as User) : null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? (rows[0] as User) : null;
    }

    async updateUser(
        _id: string,
        name: string,
        email: string,
        password: string,
        salt: string
    ): Promise<User> {
        await this.db.execute(
            `UPDATE users SET name = ?, email = ?, password = ?, salt = ? WHERE _id = ?`,
            [name, email, password, salt, _id]
        );

        return this.getUserById(_id) as Promise<User>;
    }

    async deleteUser(_id: string): Promise<User> {
        const user = await this.getUserById(_id);
        if (!user) {
            throw new Error('User not found');
        }

        await this.db.execute('DELETE FROM users WHERE _id = ?', [_id]);
        return user;
    }
}

export default UserRepository;
