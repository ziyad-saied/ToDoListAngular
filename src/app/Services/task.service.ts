import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AddTask } from '../Models/AddTask';
import {GetAllTasks} from '../Models/GetAllTasks';
@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http:HttpClient) { }
  addTask(task:AddTask):Observable<any>{
    return this.http.post<any>('http://localhost:9090/api/v1/tasks/addTask',task);
  }

  getAllTasks(page:number):Observable<any>{
    const params = new HttpParams().set('page', page);
    return this.http.get<any>('http://localhost:9090/api/v1/tasks/getAllTasks', {params});
  }

  // Service method to toggle task status
  changeToggle(id: number): Observable<any> {
    const url = `http://localhost:9090/api/v1/tasks/changeToggle?id=${id}`;
    return this.http.post(url, null, { responseType: 'text' }); // Using responseType: 'text' to handle plain text responses
  }


  // Update a task
  updateTask(id: number, updatedTask: AddTask): Observable<any> {
    return this.http.put<any>(
      `http://localhost:9090/api/v1/tasks/updateTask?id=${id}`,
      updatedTask
    );
  }


  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(
      `http://localhost:9090/api/v1/tasks/deleteById?id=${id}`
    ).pipe(
      catchError((error) => {
        console.error('Error deleting task:', error);
        return throwError(error); // Re-throw the error for further handling
      })
    );
  }




  // Method for searching tasks
  searchTasks(keyword: string): Observable<any[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<any[]>(`http://localhost:9090/api/v1/tasks/search`, { params });
  }
}
