import { Request, Response } from "express";
import { AppDataSource } from "./../../core/DataSource/data-source";
import { User } from "../../core/DataSource/entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserSchema } from "../schemas/UserSchema";
import { LoginSchema } from "../schemas/LoginSchema";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface AuthenticatedRequest extends Request {
    userId?: number;
}

export class UserController {
    // Add a user (Registration)
    async register(request: Request, response: Response) {
        const userRepository = AppDataSource.getRepository(User);
        const { firstname, lastname, email, username, password, role } =
            request.body;

        try {
            await UserSchema.validate(request.body, { abortEarly: false });
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = userRepository.create({
                firstname,
                lastname,
                email,
                username,
                password: hashedPassword,
                role: role || "user",
            });
            await userRepository.save(user);
            // Remove password from user object
            const { password: userPassword, ...userWithoutPassword } = user;
            return response.status(201).json({
                message: "User created successfully",
                user: userWithoutPassword,
            });
        } catch (error: any) {
            if (error.name === "ValidationError") {
                return response.status(400).json({
                    errors: error,
                });
            }
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }

    // User login
    async login(request: Request, response: Response) {
        const userRepository = AppDataSource.getRepository(User);
        const { username, password } = request.body;

        try {
            await LoginSchema.validate(request.body, { abortEarly: false });

            const user = await userRepository.findOne({ where: { username } });

            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password,
            );

            if (!isPasswordValid) {
                return response.status(400).json({
                    error: 400,
                    message: "Username or password invalid",
                });
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                JWT_SECRET,
                { expiresIn: "1h" },
            );

            // Remove password from user object
            const { password: userPassword, ...userWithoutPassword } = user;
            return response
                .status(200)
                .json({ token, user: userWithoutPassword });
        } catch (error: any) {
            if (error.name === "ValidationError") {
                return response.status(400).json({
                    errors: error,
                });
            }
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
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
    async getUserById(request: AuthenticatedRequest, response: Response) {
        const userId = request.userId;

        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: userId },
        });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        return response.status(200).json(user);
    }

    // Update user (restricted to self or admin)
    async updateUser(request: AuthenticatedRequest, response: Response) {
        const userId = request.userId;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        try {
            await UserSchema.validate(request.body, { abortEarly: false });
            if (request.body.password) {
                request.body.password = await bcrypt.hash(
                    request.body.password,
                    10,
                );
            }

            userRepository.merge(user, request.body);
            await userRepository.save(user);
            // Remove password from user object
            const { password: userPassword, ...userWithoutPassword } = user;
            return response.status(200).json(userWithoutPassword);
        } catch (error: any) {
            if (error.name === "ValidationError") {
                return response.status(400).json({
                    errors: error,
                });
            }
            return response
                .status(500)
                .json({ message: "Internal server error" });
        }
    }

    // Delete user (restricted to self or admin)
    async deleteUser(request: AuthenticatedRequest, response: Response) {
        const userId = request.userId;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        await userRepository.remove(user);
        return response.status(200).json({ message: "User deleted" });
    }
}
