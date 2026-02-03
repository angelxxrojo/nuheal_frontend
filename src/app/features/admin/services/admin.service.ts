import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/common.model';
import { Enfermera } from '../../../models/auth.model';
import { Subscription, Plan } from '../../../models/plan.model';

export interface UserListItem {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  enfermera_id: number;
  nombre_consultorio: string;
  plan: string;
  total_pacientes: number;
  is_active: boolean;
  created_at: string;
}

export interface UserDetail extends Enfermera {
  subscription?: Subscription;
  stats?: {
    total_pacientes: number;
    total_citas: number;
    total_controles_cred: number;
    last_login?: string;
  };
}

export interface SystemMetrics {
  total_users: number;
  active_users: number;
  paid_subscriptions: number;
  mrr: string;
  recent_users: {
    id: number;
    name: string;
    email: string;
    initials: string;
    created_at: string;
  }[];
  plans_distribution: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

export interface UsersQueryParams {
  search?: string;
  plan?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // Users Management
  getUsers(params?: UsersQueryParams): Observable<PaginatedResponse<UserListItem>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<UserListItem>>(`${this.apiUrl}/users/`, { params: httpParams });
  }

  getUserById(id: number): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.apiUrl}/users/${id}/`);
  }

  updateUser(id: number, data: Partial<UserDetail>): Observable<UserDetail> {
    return this.http.patch<UserDetail>(`${this.apiUrl}/users/${id}/`, data);
  }

  toggleUserStatus(id: number): Observable<UserDetail> {
    return this.http.post<UserDetail>(`${this.apiUrl}/users/${id}/toggle-status/`, {});
  }

  // Subscriptions Management
  getAllSubscriptions(params?: {
    status?: string;
    plan?: string;
    page?: number;
  }): Observable<PaginatedResponse<Subscription>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Subscription>>(`${this.apiUrl}/subscriptions/`, { params: httpParams });
  }

  updateSubscription(id: number, data: { plan_code: string }): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.apiUrl}/subscriptions/${id}/`, data);
  }

  // Plans Management
  getAllPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/plans/`);
  }

  updatePlan(id: number, data: Partial<Plan>): Observable<Plan> {
    return this.http.patch<Plan>(`${this.apiUrl}/plans/${id}/`, data);
  }

  // System Metrics
  getSystemMetrics(): Observable<SystemMetrics> {
    return this.http.get<SystemMetrics>(`${this.apiUrl}/metrics/`);
  }

  getUserStats(): Observable<{
    total: number;
    by_plan: Record<string, number>;
    by_month: { month: string; count: number }[];
  }> {
    return this.http.get<{
      total: number;
      by_plan: Record<string, number>;
      by_month: { month: string; count: number }[];
    }>(`${this.apiUrl}/users/stats/`);
  }
}
