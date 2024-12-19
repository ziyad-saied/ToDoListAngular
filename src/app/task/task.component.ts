import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators,ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../Services/task.service';
import { AddTask } from '../Models/AddTask';
import { GetAllTasks, GetTask } from '../Models/GetAllTasks';
import { PagenationComponent } from '../pagenation/pagenation.component';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-task',
  imports: [CommonModule, PagenationComponent,FormsModule,ReactiveFormsModule],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  standalone: true,
})
export class TaskComponent {
  isDeleteModalOpen = false;  // For controlling the visibility of the delete modal
  taskToDeleteIndex: number | null = null;  // Store the index of the task to delete
  taskForm: FormGroup;
  tas: GetTask[] = []; // Tasks retrieved from the backend
  totalItems: number = 0;
  totalPage: number = 0;
  page: number = 0;
  taskInterface: AddTask | null = null;
  updateIndex: number | null = null; // Track the index of the task being updated
  searchKeyword: string = ''; // The keyword used for searching
  isUpdateModalOpen = false;
  updateTaskForm: FormGroup;
  constructor(private task: TaskService, private cdr: ChangeDetectorRef,private fb: FormBuilder) {
    this.taskForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      dueDate: new FormControl('', [Validators.required]),
      isCompleted: new FormControl(false), // Default value
    });
    this.updateTaskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllTasks(); // Fetch tasks on component initialization
  }

  // Add a new task or save updates
  postTask(): void {
    if (this.taskForm.valid) {
      if (this.updateIndex !== null) {
        this.saveUpdate();
      } else {
        const task: AddTask = this.taskForm.value;

        this.task.addTask(task).subscribe({
          next: (response: GetTask) => {
            console.log('Task added successfully', response);
            this.tas.unshift(response); // Add the task to the top of the list
            this.sortTasksByCreatedAt(); // Sort tasks by createdAt
            this.totalItems++; // Update total tasks count
            this.taskForm.reset(); // Reset the form
          },
          error: (error) => {
            console.error('Error adding task', error);
          },
        });
      }
    }
  }

  // Fetch all tasks with pagination
  getAllTasks(): void {
    this.task.getAllTasks(this.page).subscribe({
      next: (response: GetAllTasks) => {
        this.tas = response.content;
        this.totalPage = response.totalPages;
        this.sortTasksByCreatedAt(); // Ensure tasks are sorted by createdAt
      },
      error: (error) => {
        console.error('Error fetching tasks', error);
      },
    });
  }

  // Sort tasks by createdAt in descending order
  private sortTasksByCreatedAt(): void {
    this.tas.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Newest tasks first
    });
  }
// Toggle the completion status of a task
  toggleComplete(index: number): void {
    if (index >= 0 && index < this.tas.length) {
      const task = this.tas[index];
      task.isCompleted = !task.isCompleted;

      // Perform the async action (API call)
      this.task.changeToggle(task.id).subscribe({
        next: () => {
          console.log(`Task ${task.id} toggled successfully.`);
          this.cdr.detectChanges(); // Ensure UI updates immediately
        },
        error: (error) => {
          console.error(`Error toggling task ${task.id}:`, error);
          task.isCompleted = !task.isCompleted; // Revert toggle on error
          this.cdr.detectChanges(); // Ensure UI updates after revert
        },
      });
    }
  }

  // Handle page changes
  onPageChange(page: number): void {
    if (page !== this.page) {
      this.page = page;
      this.getAllTasks();
    }
  }

  // Update a task
  updateTask(index: number): void {
    const task = this.tas[index];
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      isCompleted: task.isCompleted,
    });
    this.updateIndex = index;
  }

  // Cancel update
  cancelUpdate(): void {
    this.updateIndex = null;
    this.taskForm.reset(); // Reset the form
  }

  // Delete a task
  deleteTask(index: number): void {
    const id = this.tas[index].id;

    this.task.deleteTask(id).subscribe({
      next: () => {
        console.log(`Task ${id} deleted successfully.`);
        this.tas.splice(index, 1); // Remove the task from the list
        this.totalItems--; // Update total tasks count
      },
      error: (error) => {
        console.error(`Error deleting task ${id}:`, error);
      },
    });
  }


  // Function to open the delete confirmation modal
  openDeleteModal(index: number): void {
    this.isDeleteModalOpen = true;
    this.taskToDeleteIndex = index;  // Store the task index for deletion
  }

  // Function to close the delete confirmation modal
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.taskToDeleteIndex = null;  // Reset the task index
  }

  // Function to confirm deletion
  confirmDelete(): void {
    if (this.taskToDeleteIndex !== null) {
      // Proceed with the deletion logic here
      this.deleteTask(this.taskToDeleteIndex);
      this.closeDeleteModal();
    }
  }


  // Search tasks by keyword (title or description)
  searchTasks(): void {
    if (this.searchKeyword.trim() !== '') {
      this.task.searchTasks(this.searchKeyword).subscribe({
        next: (response: GetTask[]) => {
          this.tas = response; // Set the tasks from the response
          this.sortTasksByCreatedAt(); // Ensure tasks are sorted by createdAt
        },
        error: (error) => {
          console.error('Error searching tasks', error);
        },
      });
    }
  }

  // Detect input changes in the search bar
  onSearchInputChange(): void {
    if (this.searchKeyword.trim() === '') {
      this.getAllTasks(); // Reset to get all tasks when search bar is cleared
    } else {
      this.searchTasks(); // Search tasks if there is a keyword
    }
  }


  openUpdateModal(index: number): void {
    this.updateIndex = index;
    const task = this.tas[index];
    this.updateTaskForm.setValue({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate,
    });
    this.isUpdateModalOpen = true;
  }

  closeUpdateModal(): void {
    this.isUpdateModalOpen = false;
    this.updateIndex = null;
  }

  saveUpdate(): void {
    if (this.updateTaskForm.valid && this.updateIndex !== null) {
      this.tas[this.updateIndex] = { ...this.tas[this.updateIndex], ...this.updateTaskForm.value };
      this.closeUpdateModal();
    }
  }
}
