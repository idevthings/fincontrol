import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExpenseImportComponent } from './components/expense-import.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ExpenseImportComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fincontrol');
}
