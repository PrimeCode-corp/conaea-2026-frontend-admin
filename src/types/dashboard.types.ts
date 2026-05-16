export type DashboardData = {
  participants: {
    total: number;
    validated: number;
    pending: number;
    by_date: { date: string; count: number }[];
    by_quota_type: { quota_type: string; count: number }[];
    by_pre_sale: { pre_sale: string; count: number }[];
  };
  slots: {
    total: number;
    used: number;
    reserved: number;
    categories: number;
  };
  speakers: number;
  days: number;
  codes: { total: number; available: number; used: number };
  delegates: {
    total: number;
    by_pre_sale: { pre_sale: string; count: number }[];
  };
  universities: {
    total: number;
    with_participants: number;
  };
  activities: {
    total: number;
    by_day: { day: string; count: number }[];
  };
  top_universities: { name: string; abbreviation: string; count: number }[];
  active_pre_sale: {
    name: string;
    start_date: string;
    end_date: string;
    booking_mode: boolean;
    slots: {
      quota_type__name: string;
      amount: number;
      used: number;
      reserved: number;
    }[];
  } | null;
};
