export type FeatureCode =
  | 'max_patients'
  | 'custom_services'
  | 'whatsapp_reminders'
  | 'pdf_consent'
  | 'cred_graphs'
  | 'vaccination_calendar'
  | 'reports_his';

export interface PlanFeature {
  code: FeatureCode;
  name: string;
  is_enabled: boolean;
  limit?: number | null;
  unlimited?: boolean;
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  is_recommended: boolean;
  features: PlanFeature[];
}

export interface Subscription {
  id: number;
  plan: {
    id: number;
    code: string;
    name: string;
    price_monthly: string;
  };
  status: 'active' | 'canceled' | 'expired' | 'pending';
  start_date: string;
  end_date: string | null;
  is_valid: boolean;
  usage_stats: Record<string, UsageStat>;
}

export interface UsageStat {
  name: string;
  current: number;
  limit: number | null;
  unlimited: boolean;
  percentage: number;
}

export interface CheckFeatureResponse {
  feature_code: FeatureCode;
  has_feature: boolean;
  limit: number | null;
  unlimited: boolean;
  within_limit: boolean;
}

export interface UpgradeRequest {
  plan_code: string;
  payment_period: 'monthly' | 'yearly';
}

export interface UpgradeResponse {
  message: string;
  subscription: {
    id: number;
    plan: {
      code: string;
      name: string;
    };
    status: string;
  };
}
