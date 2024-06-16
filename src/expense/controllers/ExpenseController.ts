import { Request, Response } from "express";
import { AppDataSource } from "../../core/DataSource/data-source";
import { Expense } from "../../core/DataSource/entities/Expense";
import { User } from "../../core/DataSource/entities/User";

export class ExpenseController {
    // Add an expense
    async addExpense(request: Request, response: Response) {
        const expenseRepository = AppDataSource.getRepository(Expense);
        const userRepository = AppDataSource.getRepository(User);

        const { name, description, price } = request.body;

        const user = await userRepository.findOne({ where: { id: request.userId } });

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        const expense = expenseRepository.create({ name, description, price, user });

        try {
            await expenseRepository.save(expense);
            return response.status(201).json(expense);
        } catch (error) {
            return response.status(500).json({ message: "Error creating expense", error });
        }
    }

    // Get all expenses for the authenticated user
    async getExpenses(request: Request, response: Response) {
        const expenseRepository = AppDataSource.getRepository(Expense);

        const expenses = await expenseRepository.find({
            where: { user: { id: request.userId } },
            relations: ["user"],
        });

        return response.status(200).json(expenses);
    }

    // Get expense by id (restricted to self)
    async getExpenseById(request: Request, response: Response) {
        const expenseId = parseInt(request.params.id, 10);
        const expenseRepository = AppDataSource.getRepository(Expense);

        const expense = await expenseRepository.findOne({
            where: { id: expenseId, user: { id: request.userId } },
            relations: ["user"],
        });

        if (!expense) {
            return response.status(404).json({ message: "Expense not found or access denied" });
        }

        return response.status(200).json(expense);
    }

    // Update expense (restricted to self)
    async updateExpense(request: Request, response: Response) {
        const expenseId = parseInt(request.params.id, 10);
        const expenseRepository = AppDataSource.getRepository(Expense);

        const expense = await expenseRepository.findOne({
            where: { id: expenseId, user: { id: request.userId } },
            relations: ["user"],
        });

        if (!expense) {
            return response.status(404).json({ message: "Expense not found or access denied" });
        }

        expenseRepository.merge(expense, request.body);
        await expenseRepository.save(expense);
        return response.status(200).json(expense);
    }

    // Delete expense (restricted to self)
    async deleteExpense(request: Request, response: Response) {
        const expenseId = parseInt(request.params.id, 10);
        const expenseRepository = AppDataSource.getRepository(Expense);

        const expense = await expenseRepository.findOne({
            where: { id: expenseId, user: { id: request.userId } },
            relations: ["user"],
        });

        if (!expense) {
            return response.status(404).json({ message: "Expense not found or access denied" });
        }

        await expenseRepository.remove(expense);
        return response.status(200).json({ message: "Expense deleted" });
    }

        // Search expenses by name or description
    async searchExpenses(request: Request, response: Response) {
        const searchQuery = request.query.search;

        const expenseRepository = AppDataSource.getRepository(Expense);
        const expenses = await expenseRepository.createQueryBuilder("expense")
            .where("expense.name ILIKE :searchQuery OR expense.description ILIKE :searchQuery", { searchQuery: `%${searchQuery}%` })
            .andWhere("expense.user = :userId", { userId: request.userId })
            .getMany();

        return response.status(200).json(expenses);
    }

    // Get expenses by category
    async getExpensesByCategory(request: Request, response: Response) {
        const categoryId = request.query.categoryId;

        const expenseRepository = AppDataSource.getRepository(Expense);
        const expenses = await expenseRepository.createQueryBuilder("expense")
            .where("expense.categoryId = :categoryId", { categoryId })
            .andWhere("expense.user = :userId", { userId: request.userId })
            .getMany();

        return response.status(200).json(expenses);
    }
}
