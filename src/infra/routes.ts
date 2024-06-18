import { authMiddleware } from './../auth/middleware/auth';
import { Router } from 'express';
import { CategoryController } from '../expense/controllers/CategoryController';
import { ExpenseController } from '../expense/controllers/ExpenseController';
import { UserController } from './../auth/controllers/UserController';

const router = Router();
const categoryController = new CategoryController();
const expenseController = new ExpenseController();
const userController = new UserController();

router.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to API" });
});

// Category routes
router.get('/category/list', authMiddleware, categoryController.getCategories.bind(categoryController));
router.get('/category/:id', authMiddleware, categoryController.getCategory.bind(categoryController));
router.post('/category/register', authMiddleware, categoryController.addCategory.bind(categoryController));
router.put('/category/update/:id', authMiddleware, categoryController.updateCategory.bind(categoryController));
router.delete('/category/delete/:id', authMiddleware, categoryController.deleteCategory.bind(categoryController));

// Expense routes
router.get('/expense/list', authMiddleware, expenseController.getExpenses.bind(expenseController));
router.get('/expense/:id', authMiddleware, expenseController.getExpenseById.bind(expenseController));
router.post('/expense/register', authMiddleware, expenseController.addExpense.bind(expenseController));
router.put('/expense/update/:id', authMiddleware, expenseController.updateExpense.bind(expenseController));
router.delete('/expense/delete/:id', authMiddleware, expenseController.deleteExpense.bind(expenseController));
router.get('/expense/category/:id', authMiddleware, expenseController.getExpensesByCategory.bind(expenseController));
// search
router.get('/expense/search', authMiddleware, expenseController.searchExpenses.bind(expenseController));

// User routes
router.post('/user/register', userController.register.bind(userController));
router.get("/user/list", authMiddleware, userController.getUsers.bind(userController))
router.post('/user/login', userController.login.bind(userController));
router.get('/user', authMiddleware, userController.getUserById.bind(userController));
router.put('/user/update', authMiddleware, userController.updateUser.bind(userController));
router.delete('/user/delete', authMiddleware, userController.deleteUser.bind(userController));

export default router;
