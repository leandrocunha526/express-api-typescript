import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Expense } from "./Expense";

@Entity()
export class User {
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   firstname: string;

   @Column()
   lastname: string;

   @Column({unique: true})
   username: string;

   @Column({unique: true})
   email: string;

   @Column()
   password: string;

   @Column({default: "user"})
   role: string;

   @OneToMany(() => Expense, (expense) => expense.user)
   expenses: Expense[];

   @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
   createdAt: Date;
}
