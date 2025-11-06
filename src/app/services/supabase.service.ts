import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  // Métodos genéricos para CRUD
  async select(table: string, filters?: any) {
    let query = this.supabase.from(table).select('*');
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async insert(table: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async update(table: string, id: number, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async delete(table: string, id: number) {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

