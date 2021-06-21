import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './tasks-status.enum';
import { v4 as uuid } from 'uuid'
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';
import { TasksRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from 'src/auth/user.entity';

/**
 * We are declaring that our Service is 
 * Injectable in Controller Class
 */
@Injectable()
export class TasksService {

	constructor(
		@InjectRepository(TasksRepository) 
		private tasksRepository: TasksRepository
	) { }

	async getTasks(fileterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
		return this.tasksRepository.getTasks(fileterDto, user);
	}

	async getTaskById(id: string, user: User) : Promise<Task> {
		const found = await this.tasksRepository.findOne({ id, user });
		if(!found) {
			throw new NotFoundException();
		} 
		return found;
	}

	async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
		return this.tasksRepository.createTask(createTaskDto, user);
	}

	async updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
		const task = await this.getTaskById(id, user);
		task.status = status;
		await this.tasksRepository.save(task);
		return task;
	}

	async deleteTaskById(id: string, user: User) : Promise<void> {
		const { affected } = await this.tasksRepository.delete({ id, user });
		if(affected === 0) {
			throw new NotFoundException('Task with requested id is not found!');
		}
	}
}
