import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Plan,
  Subscription,
  UsageStat,
  CheckFeatureResponse,
  UpgradeRequest,
  UpgradeResponse,
  FeatureCode
} from '../../../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/plans/`);
  }

  getMySubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/my-subscription/`);
  }

  checkFeature(featureCode: FeatureCode): Observable<CheckFeatureResponse> {
    return this.http.get<CheckFeatureResponse>(`${this.apiUrl}/check-feature/${featureCode}/`);
  }

  getUsage(): Observable<Record<string, UsageStat>> {
    return this.http.get<Record<string, UsageStat>>(`${this.apiUrl}/usage/`);
  }

  upgrade(data: UpgradeRequest): Observable<UpgradeResponse> {
    return this.http.post<UpgradeResponse>(`${this.apiUrl}/upgrade/`, data);
  }

  cancelSubscription(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cancel/`, {});
  }
}
