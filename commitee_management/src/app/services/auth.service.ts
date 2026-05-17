import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '@supabase/supabase-js';
import { Profile } from '../models';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly profileSubject = new BehaviorSubject<Profile | null>(null);

  readonly user$ = this.userSubject.asObservable();
  readonly profile$ = this.profileSubject.asObservable();

  constructor() {
    void this.restoreSession();
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.userSubject.next(session?.user ?? null);
      if (session?.user) {
        void this.ensureProfile();
      } else {
        this.profileSubject.next(null);
      }
    });
  }

  async restoreSession() {
    const { data } = await this.supabase.auth.getUser();
    this.userSubject.next(data.user);
    if (data.user) {
      await this.ensureProfile();
    }
  }

  async currentUser() {
    const cached = this.userSubject.getValue();
    if (cached) return cached;

    const { data } = await this.supabase.auth.getUser();
    this.userSubject.next(data.user);
    return data.user;
  }

  async ensureProfile() {
    const user = await this.currentUser();
    if (!user) {
      return null;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      this.profileSubject.next(data as Profile);
      return data as Profile;
    }

    const fallbackName = user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'Member';
    const { data: created, error: createError } = await this.supabase
      .from('users')
      .insert({ id: user.id, full_name: fallbackName })
      .select('*')
      .single();

    if (createError) {
      throw createError;
    }

    this.profileSubject.next(created as Profile);
    return created as Profile;
  }

  async signup(fullName: string, email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) {
      throw error;
    }
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    // Don't block navigation on profile loading — load in background to improve perceived login speed.
    void this.ensureProfile().catch(() => undefined);

    return data;
  }

  async forgotPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth`
    });
    if (error) {
      throw error;
    }
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.userSubject.next(null);
    this.profileSubject.next(null);
  }
}
