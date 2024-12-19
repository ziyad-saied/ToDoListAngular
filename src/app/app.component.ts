import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TaskComponent} from './task/task.component'
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ToDoApp';
}
