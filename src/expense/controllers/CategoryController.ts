import { Request, Response } from "express";
import { Category } from "../../core/DataSource/entities/Category";
import { AppDataSource } from "../../core/DataSource/data-source";

export class CategoryController {
    // Add a new category
    async addCategory(request: Request, response: Response) {
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = categoryRepository.create(request.body);
        await categoryRepository.save(category);
        return response.status(201).json(category);
    }

    // Get all categories
    async getCategories(request: Request, response: Response) {
        const categoryRepository = AppDataSource.getRepository(Category);
        const categories = await categoryRepository.find();
        return response.status(200).json(categories);
    }

    // Get a category by ID
    async getCategory(request: Request, response: Response) {
        const categoryId = parseInt(request.params.id, 10);
        const category = await AppDataSource.getRepository(Category).findOne({
            where: { id: categoryId },
            relations: ['expenses']
        });
        if (!category) {
            return response.status(404).json({ message: "Category not found" });
        }
        return response.status(200).json(category);
    }

    // Update a category
    async updateCategory(request: Request, response: Response) {
        const categoryId = parseInt(request.params.id, 10);
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = await categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['expenses']
        });
        if (!category) {
            return response.status(404).json({ message: "Category not found" });
        }
        categoryRepository.merge(category, request.body);
        await categoryRepository.save(category);
        return response.status(200).json(category);
    }

    // Delete a category
    async deleteCategory(request: Request, response: Response) {
        const categoryId = parseInt(request.params.id, 10);
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = await categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
            return response.status(404).json({ message: "Category not found" });
        }
        await categoryRepository.remove(category);
        return response.status(200).json({ message: "Category deleted" });
    }
}
