import { Request, Response } from 'express';
import crypto from 'crypto';
import UserRepository from '../repositories/UserRepository';
import { User } from '../models/User';

class UserController {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    public async index(req: Request, res: Response): Promise<void> {
        const users: User[] = await this.userRepository.getAllUsers();
        
        res.send(users);
    }

    public async getUserById(req: Request, res: Response): Promise<void> {
        const userId: string = req.params.id;
        const user: User | null = await this.userRepository.getUserById(userId);
        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        res.send(user);
    }

    public async register(req: Request, res: Response): Promise<void> {
        let { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            res.status(400).send('Missing required fields');
            return;
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = this.hashPassword(password, salt);

        const user = await this.userRepository.getUserByEmail(email);
        if (user) {
            res.status(418).send('User already exists');
            return;
        }

        const newUser: User = await this.userRepository.createNewUser(
            name,
            username,
            email,
            hashedPassword,
            salt,
        );

        res.status(201).send(newUser);
    }

    public async updateUser(req: Request, res: Response): Promise<void> {
        let { name, email, password } = req.body;
        const userId: string = req.params.id;

        if (!name || !email || !password) {
            res.status(400).send('Missing required fields');
            return;
        }

        const salt = crypto.randomBytes(16).toString('hex'); 
        const hashedPassword = this.hashPassword(password, salt);

        const updatedUser: User = await this.userRepository.updateUser(
            userId,
            name,
            email,
            hashedPassword,
            salt,
        );

        if (!updatedUser) {
            res.status(404).send('User not found');
            return;
        }

        res.send(updatedUser);
    }

    public async deleteUser(req: Request, res: Response): Promise<void> {
        const userId: string = req.params.id;

        let userExists = await this.userRepository.getUserById(userId);
        if (!userExists) {
            res.status(404).send('User not found');
            return;
        }

        const deletedUser: User = await this.userRepository.deleteUser(userId);

        res.send(deletedUser);
    }

    public async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).send('Missing required fields');
            return;
        }

        const isValid = await this.verifyUserPassword(email, password);

        if (!isValid) {
            res.status(401).send('Invalid email or password');
            return;
        }

        const user: User | null = await this.userRepository.getUserByEmail(email);

        res.send({ ...user });

    }

    private hashPassword(password: string, salt: string): string {
        const hash = crypto.createHmac('sha256', salt);
        hash.update(password);
        return hash.digest('hex');
    }

    private async verifyUserPassword(email: string, password: string): Promise<boolean> {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) return false;

        const hashedPassword = this.hashPassword(password, user.salt);
        return hashedPassword === user.password;
    }
}

export default UserController;