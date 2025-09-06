import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseConfig {
  private supabase: SupabaseClient;

  constructor() {
    console.log('[SupabaseConfig] Initializing Supabase client');
    this.validateEnvironment();
    console.log('[SupabaseConfig] Environment validated successfully');
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
    console.log('[SupabaseConfig] Supabase client created');
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  private validateEnvironment(): void {
    if (!environment.supabaseUrl || environment.supabaseUrl === 'your-supabase-url-here') {
      throw new Error(
        'Supabase URL not configured. Please update src/environments/environment.ts with your Supabase project URL.'
      );
    }

    if (!environment.supabaseKey || environment.supabaseKey === 'your-supabase-anon-key-here') {
      throw new Error(
        'Supabase key not configured. Please update src/environments/environment.ts with your Supabase anon key.'
      );
    }

    // Validate URL format
    try {
      new URL(environment.supabaseUrl);
    } catch {
      throw new Error('Invalid Supabase URL format. Please check your configuration.');
    }
  }
}
