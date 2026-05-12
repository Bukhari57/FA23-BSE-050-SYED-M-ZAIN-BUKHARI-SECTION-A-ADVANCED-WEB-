import { Injectable, inject } from '@angular/core';
import { Committee, CommitteeMember, NotificationItem, Payment, Profile } from '../models';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class CommitteeService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);

  async dashboard() {
    const user = await this.auth.currentUser();
    if (!user) {
      return { joined: [], created: [], payments: [], notifications: [] };
    }

    const [joined, created, payments, notifications] = await Promise.all([
      this.myJoinedCommittees(user.id),
      this.myCreatedCommittees(user.id),
      this.myPendingPayments(user.id),
      this.notifications(user.id)
    ]);

    return { joined, created, payments, notifications };
  }

  async listOpenCommittees() {
    const { data, error } = await this.supabase
      .from('committees')
      .select('*, creator:users(*), committee_members(count)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    return data.map((committee: any) => ({
      ...committee,
      member_count: committee.committee_members?.[0]?.count ?? 0
    })) as Committee[];
  }

  async myJoinedCommittees(userId: string) {
    const { data, error } = await this.supabase
      .from('committee_members')
      .select('committee:committees(*, creator:users(*))')
      .eq('user_id', userId)
      .eq('status', 'approved');
    if (error) {
      throw error;
    }
    return data.map((row: any) => row.committee) as Committee[];
  }

  async myCreatedCommittees(userId: string) {
    const { data, error } = await this.supabase
      .from('committees')
      .select('*, creator:users(*)')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    return data as Committee[];
  }

  async createCommittee(input: Partial<Committee>) {
    const user = await this.auth.currentUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    const { data, error } = await this.supabase
      .from('committees')
      .insert({ ...input, creator_id: user.id, status: 'open', current_month: 1 })
      .select('*')
      .single();
    if (error) {
      throw error;
    }

    const { error: memberError } = await this.supabase.from('committee_members').insert({
      committee_id: data.id,
      user_id: user.id,
      turn_order: 1,
      status: 'approved'
    });
    if (memberError) {
      throw memberError;
    }

    await this.supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Committee created',
      body: `${data.name} is open for members.`
    });

    return data as Committee;
  }

  async getCommittee(id: string) {
    const [committee, members, payments] = await Promise.all([
      this.supabase.from('committees').select('*, creator:users(*)').eq('id', id).single(),
      this.supabase
        .from('committee_members')
        .select('*, profile:users(*)')
        .eq('committee_id', id)
        .order('turn_order', { ascending: true }),
      this.supabase
        .from('payments')
        .select('*, member:committee_members(*, profile:users(*))')
        .eq('committee_id', id)
        .order('month_number', { ascending: true })
    ]);

    if (committee.error) {
      throw committee.error;
    }
    if (members.error) {
      throw members.error;
    }
    if (payments.error) {
      throw payments.error;
    }

    return {
      committee: committee.data as Committee,
      members: members.data as CommitteeMember[],
      payments: payments.data as Payment[]
    };
  }

  async requestJoin(committeeId: string, details: Partial<CommitteeMember>) {
    const user = await this.auth.currentUser();
    if (!user) {
      throw new Error('You must be logged in.');
    }

    const { data: existing } = await this.supabase
      .from('committee_members')
      .select('id')
      .eq('committee_id', committeeId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      throw new Error('You already requested or joined this committee.');
    }

    const { data: maxTurn } = await this.supabase
      .from('committee_members')
      .select('turn_order')
      .eq('committee_id', committeeId)
      .order('turn_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await this.supabase.from('committee_members').insert({
      committee_id: committeeId,
      user_id: user.id,
      turn_order: (maxTurn?.turn_order ?? 0) + 1,
      status: 'pending',
      ...details
    });
    if (error) {
      throw error;
    }
  }

  async updateMemberStatus(memberId: string, status: 'approved' | 'removed') {
    const { error } = await this.supabase.from('committee_members').update({ status }).eq('id', memberId);
    if (error) {
      throw error;
    }
  }

  async savePayment(payment: Partial<Payment>, proof?: File) {
    let proofUrl = payment.proof_url;
    if (proof) {
      const path = `${payment.committee_id}/${Date.now()}-${proof.name}`;
      const { error: uploadError } = await this.supabase.storage.from('payment-proofs').upload(path, proof);
      if (uploadError) {
        throw uploadError;
      }
      const { data } = this.supabase.storage.from('payment-proofs').getPublicUrl(path);
      proofUrl = data.publicUrl;
    }

    const { error } = await this.supabase.from('payments').upsert({ ...payment, proof_url: proofUrl });
    if (error) {
      throw error;
    }
  }

  async confirmPayment(paymentId: string) {
    const user = await this.auth.currentUser();
    const { error } = await this.supabase
      .from('payments')
      .update({ status: 'confirmed', confirmed_by: user?.id, paid_at: new Date().toISOString() })
      .eq('id', paymentId);
    if (error) {
      throw error;
    }
  }

  async myPendingPayments(userId: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*, member:committee_members!inner(*, profile:users(*)), committee:committees(*)')
      .eq('member.user_id', userId)
      .in('status', ['pending', 'paid']);
    if (error) {
      throw error;
    }
    return data as Payment[];
  }

  async notifications(userId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) {
      throw error;
    }
    return data as NotificationItem[];
  }

  subscribeToNotifications(userId: string, onChange: () => void) {
    return this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        onChange
      )
      .subscribe();
  }

  async adminStats() {
    const [profiles, committees, payments] = await Promise.all([
      this.supabase.from('users').select('*').order('created_at', { ascending: false }),
      this.supabase.from('committees').select('*').order('created_at', { ascending: false }),
      this.supabase.from('payments').select('*')
    ]);
    if (profiles.error) {
      throw profiles.error;
    }
    if (committees.error) {
      throw committees.error;
    }
    if (payments.error) {
      throw payments.error;
    }
    return {
      users: profiles.data as Profile[],
      committees: committees.data as Committee[],
      payments: payments.data as Payment[]
    };
  }

  async banUser(userId: string, banned: boolean) {
    const { error } = await this.supabase.from('users').update({ is_banned: banned }).eq('id', userId);
    if (error) {
      throw error;
    }
  }
}
