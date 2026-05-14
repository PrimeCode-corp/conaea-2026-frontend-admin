export type DashboardData = {
  participants: { total: number; validated: number; pending: number };
  slots: { total: number; categories: number };
  speakers: number;
  days: number;
  codes: { total: number; available: number; used: number };
  active_pre_sale: {
    name: string;
    start_date: string;
    end_date: string;
    slots: { quota_type__name: string; amount: number }[];
  } | null;
};
