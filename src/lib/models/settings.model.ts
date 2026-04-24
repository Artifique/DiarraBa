// filepath: src/lib/models/settings.model.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Setting, TableName } from '@/types/database';

export class SettingsModel {
  private supabase: SupabaseClient;
  private tableName: TableName = 'settings';

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findAll(): Promise<Setting[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*');
    if (error) throw error;
    return data as Setting[];
  }

  async findById(id: string): Promise<Setting | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
    return data as Setting | null;
  }

  async findByKey(key: string): Promise<Setting | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('key', key)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as Setting | null;
  }

  async create(data: Omit<Setting, 'id' | 'date_creation' | 'date_modification'>): Promise<Setting> {
    const { data: newSetting, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select('*')
      .single();
    if (error) throw error;
    return newSetting as Setting;
  }

  async update(id: string, data: Partial<Omit<Setting, 'id' | 'date_creation' | 'date_modification'>>): Promise<Setting> {
    const { data: updatedSetting, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return updatedSetting as Setting;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
