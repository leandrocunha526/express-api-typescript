import { Request, Response } from "express";
import { AppDataSource } from "./../../core/DataSource/data-source";
import { User } from "../../core/DataSource/entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export class UserController {
    // Add a user (Registration)
    async register(request: Request, response: Response) {
        const userRepository = AppDataSource.getRepository(User);
        const { firstname, lastname, email, username, password, role } = request.body;

        if (!firstname || !lastname || !email || !username || !password) {
            return response.status(400).json({ message: "Username and password are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create(
            {
                firstname, lastname, email, username, password: hashedPassword, role: role || "user"
            });

        try {
            await userRepository.save(user);
            return response.status(201).json(user);
        } catch (error) {
            return response.status(500).json({ message: "Error creating user", error });
        }
    }

    // User login
    async login(request: Request, response: Response) {
        const userRepository = AppDataSource.getRepository(User);
        const { username, password } = request.body;

        if (!username || !password) {
            return response.status(400).json({ message: "Username and password are required" });
        }

        const user = await userRepository.findOne({ where: { username } });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return response.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        // Remove password from user object
        const { password: userPassword, ...userWithoutPassword } = user;
        return response.json({ user: userWithoutPassword, token });
    }

    // Get all users (only for admin)
    async getUsers(request: Request, response: Response) {
        if (request.role !== "admin") {
            return response.status(403).json({ message: "Access denied" });
        }

        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();
        return response.status(200).json(users);
    }

    // Get user by id (restricted to self)
    async getUserById(request: Request, response: Response) {
        const userId = parseInt(request.params.id, 10);

        // Verifica se o usuário autenticado está acessando seu próprio perfil
        if (request.userId !== userId && request.role !== "admin") {
            return response.status(403).json({ message: "Access denied" });
        }

        const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        return response.status(200).json(user);
    }

    // Update user (restricted to self or admin)
    async updateUser(request: Request, response: Response) {
        const userId = parseInt(request.params.id, 10);

        // Verifica se o usuário autenticado está atualizando seu próprio perfil
        if (request.userId !== userId && request.role !== "admin") {
            return response.status(403).json({ message: "Access denied" });
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        if (request.body.password) {
            request.body.password = await bcrypt.hash(request.body.password, 10);
        }

        userRepository.merge(user, request.body);
        await userRepository.save(user);
        return response.status(200).json(user);
    }

    // Delete user (restricted to self or admin)
    async deleteUser(request: Request, response: Response) {
        const userId = parseInt(request.params.id, 10);

        // Verifica se o usuário autenticado está deletando seu próprio perfil
        if (request.userId !== userId && request.role !== "admin") {
            return response.status(403).json({ message: "Access denied" });
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        await userRepository.remove(user);
        return response.status(200).json({ message: "User deleted" });
    }
}
