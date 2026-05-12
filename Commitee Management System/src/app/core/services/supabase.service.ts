import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabaseUrl = environment.supabaseUrl;
  private readonly supabaseAnonKey = environment.supabaseAnonKey;
  private readonly profileBucket = environment.supabaseProfileBucket;

  private readonly client: SupabaseClient | null =
    this.supabaseUrl && this.supabaseAnonKey
      ? createClient(this.supabaseUrl, this.supabaseAnonKey)
      : null;

  get isConfigured(): boolean {
    return Boolean(this.client);
  }

  async uploadMemberProfileImage(file: File): Promise<string> {
    if (!this.client) {
      throw new Error('Supabase is not configured. Add SUPABASE URL and ANON KEY in environment files.');
    }

    const extension = file.name.split('.').pop() ?? 'jpg';
    const path = `members/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await this.client.storage
      .from(this.profileBucket)
      .upload(path, file, {
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) {
      if (uploadError.message.toLowerCase().includes('bucket not found')) {
        throw new Error(
          `Supabase bucket "${this.profileBucket}" was not found. Create it in Storage and retry.`,
        );
      }
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    const { data } = this.client.storage.from(this.profileBucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
