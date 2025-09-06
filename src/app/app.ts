import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExpenseImportComponent } from './components/expense-import.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ExpenseImportComponent, MatToolbarModule, MatCardModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fincontrol');
}
