export type Application = {
  id: number;
  app_title: string;
  football_rules: string;
  interface_content: string;
  is_esports_open?: boolean;
  updated_at: string;
};

/** Raw user payload from API (login / me). */
export type ApiUser = {
  id?: number;
  username: string;
  nickname?: string | null;
  phone?: string | null;
  role?: number;
  coin_balance?: number;
  last_ip_addresses?: string | string[] | null;
  /** Legacy / optional fields — not in GET /me, kept for other endpoints if present */
  balance?: number;
  cash_out?: string | null;
  cash_out_id?: string | null;
  cash_code?: string | null;
};

/** Normalized user used in the app UI. */
export type MeUser = {
  id?: number;
  username: string;
  nickname?: string | null;
  balance: number;
  phone?: string | null;
  role?: number;
  last_ip_addresses?: string | string[] | null;
  cash_out?: string | null;
  cash_out_id?: string | null;
  cash_code?: string | null;
};

export type ApplicationResponse = {
  application: Application;
};

export type MeResponse = {
  user: ApiUser;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: ApiUser;
};

export type LogoutResponse = {
  message: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type ChangePasswordResponse = {
  message?: string;
};

export type Activity = {
  id: number;
  type?: string | null;
  description?: string | null;
  message?: string | null;
  remark?: string | null;
  content?: string | null;
  title?: string | null;
  amount?: number | string | null;
  coin?: number | string | null;
  coin_amount?: number | string | null;
  balance_after?: number | string | null;
  created_at: string;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ActivitiesResponse = {
  activities: Activity[];
  meta?: PaginationMeta;
};

export type TransactionUserRef =
  | string
  | { username?: string | null; nickname?: string | null }
  | null;

export type CoinTransactionType = 'add' | 'deduct';
export type CoinTransactionDirection = 'received' | 'sent';

export type CoinTransaction = {
  id: number;
  type: CoinTransactionType;
  amount: number;
  direction: CoinTransactionDirection;
  from_user: TransactionUserRef;
  to_user: TransactionUserRef;
  created_at: string;
};

export type CoinTransactionsResponse = {
  transactions: CoinTransaction[];
  meta: PaginationMeta;
};

export type PaymentProvider = 'kbz_pay' | 'wave_pay' | 'ayapay' | 'cb_pay' | 'other';

export type PaymentAccount = {
  id: number;
  provider: PaymentProvider | string;
  account_name: string;
  account_number: string;
  is_bound: boolean;
  is_enabled: boolean;
  created_at?: string;
};

export type PaymentAccountsResponse = {
  payment_accounts: PaymentAccount[];
};

export type AgentSummary = {
  id: number;
  username: string;
  nickname?: string | null;
  phone?: string | null;
};

export type DepositPaymentAccountsResponse = {
  agent: AgentSummary | null;
  payment_accounts: PaymentAccount[];
};

export type CreatePaymentAccountPayload = {
  provider: PaymentProvider;
  account_name: string;
  account_number: string;
};

export type UpdatePaymentAccountPayload = {
  provider?: PaymentProvider;
  account_name?: string;
  account_number?: string;
  is_enabled?: boolean;
};

export type CoinRequestPayload = {
  amount: number;
  payment_account_id: number;
  note?: string;
};

export type CoinRequestSource = 'request' | 'direct';

export type CoinRequestPaymentAccount = {
  id: number;
  provider: string;
  account_name: string;
  account_number: string;
};

export type CoinRequestUserRef = {
  id: number;
  username: string;
  nickname?: string | null;
  phone?: string | null;
  role?: number;
};

export type CoinRequestProcessedBy = {
  id: number;
  username: string;
  phone?: string | null;
};

export type CoinRequest = {
  id: number;
  type: 'deposit' | 'withdraw';
  source: CoinRequestSource | string;
  coin_transaction_id: number | null;
  amount: number;
  balance_before: number | null;
  balance_after: number | null;
  status: string;
  note: string | null;
  reject_reason: string | null;
  processed_at: string | null;
  created_at: string;
  user: CoinRequestUserRef;
  agent: AgentSummary | null;
  payment_account: CoinRequestPaymentAccount | null;
  processed_by: CoinRequestProcessedBy | null;
};

export type CoinRequestResponse = {
  message?: string;
  coin_request: CoinRequest;
};

export type CoinRequestsResponse = {
  coin_requests: CoinRequest[];
  meta: PaginationMeta;
};

export type FootballNewsArticle = {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  view_count: number;
  love_count: number;
  is_loved: boolean;
  created_at: string;
  updated_at?: string;
};

export type FootballNewsListResponse = {
  news: FootballNewsArticle[];
  meta: PaginationMeta;
};

export type FootballNewsDetailResponse = {
  news: FootballNewsArticle;
};

export type FootballNewsLoveResponse = {
  message?: string;
  love_count: number;
  is_loved: boolean;
};

/** Map API user fields (e.g. coin_balance) into app MeUser. */
export function mapApiUser(user: ApiUser): MeUser {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname ?? null,
    balance: user.coin_balance ?? user.balance ?? 0,
    phone: user.phone ?? null,
    role: user.role,
    last_ip_addresses: user.last_ip_addresses ?? null,
    cash_out: user.cash_out ?? null,
    cash_out_id: user.cash_out_id ?? null,
    cash_code: user.cash_code ?? null,
  };
}
