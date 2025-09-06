import { Injectable, ErrorHandler, inject, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errors: string[] = [];
  private isDevelopment = isDevMode();

  handleError(error: any, context?: string): void {
    const errorMessage = this.formatError(error, context);

    if (this.isDevelopment) {
      console.error('Application Error:', errorMessage, error);
    } else {
      // In production, log to external service
      this.logToExternalService(errorMessage, error);
    }

    this.errors.push(errorMessage);

    // Keep only the last 50 errors in memory
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  private logToExternalService(message: string, error: any): void {
    // In a real application, you would send this to a logging service like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging endpoint

    const logData = {
      message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      }
    };

    // For now, just store in localStorage for debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      existingLogs.push(logData);
      // Keep only last 100 logs
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      localStorage.setItem('app_logs', JSON.stringify(existingLogs));
    } catch {
      // Ignore localStorage errors
    }
  }

  getLastError(): string | null {
    return this.errors[this.errors.length - 1] || null;
  }

  getAllErrors(): string[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  private formatError(error: any, context?: string): string {
    const timestamp = new Date().toISOString();
    let message = `[${timestamp}] `;

    if (context) {
      message += `${context}: `;
    }

    if (error instanceof Error) {
      message += error.message;
    } else if (typeof error === 'string') {
      message += error;
    } else if (error?.message) {
      message += error.message;
    } else {
      message += 'Unknown error occurred';
    }

    return message;
  }
}

// Global error handler
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errorService = inject(ErrorHandlingService);

  handleError(error: any): void {
    this.errorService.handleError(error, 'Global Error Handler');

    // Let Angular handle the error normally in development
    console.error('Unhandled error:', error);
  }
}
