import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fincontrol');
  protected readonly isImportMode = signal(false);

  constructor(private router: Router) {}

  toggleMode() {
    const newMode = !this.isImportMode();
    this.isImportMode.set(newMode);
    
    // Navigate to the appropriate route
    if (newMode) {
      this.router.navigate(['/import']);
    } else {
      this.router.navigate(['/categorize']);
    }
  }
}
