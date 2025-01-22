import { createPool, Pool, RowDataPacket } from 'mysql2/promise';
import { Post } from '../models/Post';
import dotenv from 'dotenv';

class PostRepository {
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

    async getAllPosts(): Promise<Post[]> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT * FROM posts');
        return rows as Post[];
    }

    async getPostsByUserId(userId: number): Promise<Post[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT * FROM posts WHERE userId = ?',
            [userId]
        );
        return rows as Post[];
    }

    async createPost(userId: number, timestamp: string, comment: string): Promise<Post> {
        const [result] = await this.db.execute(
            `INSERT INTO posts (userId, timestamp, comment) VALUES (?, ?, ?)`,
            [userId, timestamp, comment]
        );
        const insertId = (result as any).insertId;

        return this.getPostById(insertId.toString()) as Promise<Post>;
    }

    async getPostById(_id: string): Promise<Post | null> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT * FROM posts WHERE _id = ?', [_id]);
        return rows.length > 0 ? (rows[0] as Post) : null;
    }

    async updatePost(_id: string, comment: string): Promise<Post> {
        await this.db.execute(
            `UPDATE posts SET comment = ? WHERE _id = ?`,
            [comment, _id]
        );

        return this.getPostById(_id) as Promise<Post>;
    }

    async deletePost(_id: string): Promise<Post> {
        const post = await this.getPostById(_id);
        if (!post) {
            throw new Error('Post not found');
        }

        await this.db.execute('DELETE FROM posts WHERE _id = ?', [_id]);
        return post;
    }
}

export default PostRepository;
