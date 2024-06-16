import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./Category";
import { User } from "./User";

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column("decimal", { precision: 5, scale: 2, default: 0, name: "price" })
    price: number;

    @Column()
    description: string;

    @ManyToOne(() => Category, (category) => category.expenses)
    category: Category;

    @ManyToOne(() => User, (user) => user.expenses)
    user: User;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}
