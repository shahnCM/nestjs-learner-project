import { User } from "src/auth/user.entity";
import { EntityRepository, Repository } from "typeorm";
import { CreateTaskDto } from "./dto/create-task.dto";
import { GetTasksFilterDto } from "./dto/get-task-filter.dto";
import { Task } from "./task.entity";
import { TaskStatus } from "./tasks-status.enum";

/**
 * Here We Define Our Complex Query Method
 * We only Inject Our Entity in the Decorator
 */ 
@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('task');

        query.where({ user });

        if(status) {
            query.andWhere('task.status = :status', { status });
        }

        if(search) {
            query.andWhere(
                /**
                 * Here we have to wrap the query inside first bracket 
                 * because of the 'OR' condition
                 */
                '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)', 
                { search: `%${search.toLowerCase()}%` }
            );
        }

        const tasks = await query.getMany();
        return tasks;
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;
		const task = this.create({
			title,
			description,
			status: TaskStatus.OPEN,
            user,
		})
		await this.save(task);
		return task;
    }
}