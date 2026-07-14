-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: events
CREATE TABLE public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    event_date date NOT NULL,
    location varchar(500) NOT NULL,
    registration_open_at timestamptz NOT NULL,
    registration_close_at timestamptz NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for events
CREATE INDEX idx_events_is_active ON public.events (is_active);
CREATE INDEX idx_events_event_date ON public.events (event_date);

-- Table 2: event_categories
CREATE TABLE public.event_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    name varchar(50) NOT NULL,
    distance_km numeric(5,2) NOT NULL,
    price integer NOT NULL,
    quota integer NOT NULL,
    reserved_count integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for event_categories
CREATE INDEX idx_event_categories_event_id ON public.event_categories (event_id);
CREATE INDEX idx_event_categories_event_active ON public.event_categories (event_id, is_active);

-- Table 3: registrations
CREATE TABLE public.registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number varchar(20) UNIQUE NOT NULL,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    event_category_id uuid NOT NULL REFERENCES public.event_categories(id) ON DELETE RESTRICT,
    full_name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(20) NOT NULL,
    nik varchar(16) NOT NULL,
    gender varchar(10) NOT NULL,
    birth_place varchar(255) NOT NULL,
    birth_date date NOT NULL,
    nationality varchar(50) NOT NULL DEFAULT 'WNI',
    address text NOT NULL,
    blood_type varchar(5),
    medical_history text,
    jersey_size varchar(5) NOT NULL,
    emergency_contact_name varchar(255) NOT NULL,
    emergency_contact_phone varchar(20) NOT NULL,
    registration_status varchar(20) NOT NULL DEFAULT 'pending_payment',
    qr_code_token uuid UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for registrations
CREATE UNIQUE INDEX idx_registrations_email_event_active ON public.registrations (email, event_id) 
    WHERE (registration_status NOT IN ('cancelled', 'expired'));
CREATE INDEX idx_registrations_phone ON public.registrations (phone);
CREATE INDEX idx_registrations_event_category_id ON public.registrations (event_category_id);
CREATE INDEX idx_registrations_status ON public.registrations (registration_status);

-- Table 4: transactions
CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
    order_id varchar(50) UNIQUE NOT NULL,
    amount integer NOT NULL,
    payment_type varchar(30),
    transaction_status varchar(20) NOT NULL DEFAULT 'pending',
    midtrans_transaction_id varchar(100),
    snap_token varchar(255),
    snap_redirect_url text,
    paid_at timestamptz,
    expired_at timestamptz,
    raw_notification jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for transactions
CREATE INDEX idx_transactions_registration_id ON public.transactions (registration_id);
CREATE INDEX idx_transactions_status ON public.transactions (transaction_status);

-- Table 5: profiles (Admin profiles linked to auth.users)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name varchar(255) NOT NULL,
    role varchar(20) NOT NULL DEFAULT 'admin',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- DATABASE FUNCTIONS (ATOMIC OPERATIONS)

-- Function: fn_reserve_slot
CREATE OR REPLACE FUNCTION public.fn_reserve_slot(p_category_id uuid)
RETURNS boolean AS $$
DECLARE
  v_quota integer;
  v_reserved integer;
BEGIN
  SELECT quota, reserved_count
  INTO v_quota, v_reserved
  FROM public.event_categories
  WHERE id = p_category_id
  FOR UPDATE;  -- row-level lock

  IF v_reserved >= v_quota THEN
    RETURN false;  -- quota full
  END IF;

  UPDATE public.event_categories
  SET reserved_count = reserved_count + 1,
      updated_at = now()
  WHERE id = p_category_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function: fn_release_slot
CREATE OR REPLACE FUNCTION public.fn_release_slot(p_category_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.event_categories
  SET reserved_count = GREATEST(reserved_count - 1, 0),
      updated_at = now()
  WHERE id = p_category_id;
END;
$$ LANGUAGE plpgsql;

-- Function: fn_generate_registration_number
CREATE OR REPLACE FUNCTION public.fn_generate_registration_number(p_event_id uuid)
RETURNS varchar AS $$
DECLARE
  v_prefix varchar;
  v_count integer;
BEGIN
  -- Get event prefix from name (first 2 chars of non-spaced uppercase name + year)
  SELECT UPPER(LEFT(REPLACE(name, ' ', ''), 2)) || 
         EXTRACT(YEAR FROM event_date)::varchar
  INTO v_prefix
  FROM public.events WHERE id = p_event_id;

  -- Count existing registrations for this event to generate next ID
  SELECT COUNT(*) + 1
  INTO v_count
  FROM public.registrations
  WHERE event_id = p_event_id;

  RETURN v_prefix || '-' || LPAD(v_count::varchar, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function: fn_update_timestamp
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

CREATE TRIGGER trg_event_categories_updated BEFORE UPDATE ON public.event_categories
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

CREATE TRIGGER trg_registrations_updated BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

CREATE TRIGGER trg_transactions_updated BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

-- ROW LEVEL SECURITY (RLS) SETUP

-- Events RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events public read" ON public.events FOR SELECT USING (true);
CREATE POLICY "Events admin write" ON public.events FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Event Categories RLS
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.event_categories FOR SELECT USING (true);
CREATE POLICY "Categories admin write" ON public.event_categories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Registrations RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registrations public insert" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Registrations admin all" ON public.registrations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transactions admin read" ON public.transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles own read" ON public.profiles FOR SELECT
  USING (id = auth.uid());
