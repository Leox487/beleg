export interface InboundEndpoint {
  id: string;
  venture_id: string;
  email_address: string;
  is_active: boolean;
  created_at: Date;
  last_ingested_at: Date | null;
}

export interface EmailWhitelist {
  id: string;
  venture_id: string;
  sender_email: string;
  created_at: Date;
}

export interface IngestedEmail {
  id: string;
  endpoint_id: string;
  milestone_id: string | null;
  raw_eml: string;
  plain_text_body: string | null;
  html_body: string | null;
  subject_line: string | null;
  from_address: string | null;
  sent_at: Date | null;
  dkim_verified: boolean;
  dkim_domain: string | null;
  dkim_selector: string | null;
  verification_error: string | null;
  status: "pending" | "verified" | "rejected" | "milestone_created" | "failed";
  processed_at: Date | null;
  created_at: Date;
  attachment_urls: string[];
}

export interface StripeConnection {
  id: string;
  venture_id: string;
  clerk_user_id: string;
  stripe_account_id: string;
  stripe_secret_key_enc: string | null;
  webhook_secret: string;
  created_at: Date;
}
