-- Seed events
INSERT INTO
    public.events (
        id,
        name,
        description,
        event_date,
        location,
        registration_open_at,
        registration_close_at,
        is_active
    )
VALUES (
        'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
        'Fun Run 2026',
        'Fun Run 2026 - Lari Bersama untuk Indonesia Sehat!',
        '2026-11-15',
        'Stadion Si Jalak Harupat, Soreang, Kab. Bandung',
        '2026-06-01 00:00:00+07',
        '2026-11-01 23:59:59+07',
        true
    ),
    (
        'b3d3e64c-8e4a-4a25-83f0-4fa91563fcd7',
        'Bandung City Run 2027',
        'Bandung City Run 2027 - Menelusuri sejarah Kota Kembang',
        '2027-03-22',
        'Gedung Sate, Jl. Diponegoro No.22, Bandung',
        '2026-12-01 00:00:00+07',
        '2027-03-01 23:59:59+07',
        true
    ),
    (
        'c4f5e74d-9a5b-4c26-9f43-8fb12543eef8',
        'Garuda Heritage Run 2027',
        'Garuda Heritage Run 2027 - Berlari di area warisan budaya Prambanan',
        '2027-06-01',
        'Candi Prambanan, Sleman, Yogyakarta',
        '2027-01-01 00:00:00+07',
        '2027-05-01 23:59:59+07',
        false
    ) ON CONFLICT (id) DO NOTHING;

-- Seed event_categories
INSERT INTO
    public.event_categories (
        id,
        event_id,
        name,
        distance_km,
        price,
        quota,
        reserved_count,
        is_active
    )
VALUES (
        'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a',
        'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
        '5K Fun Run',
        5.00,
        150000,
        500,
        2,
        true
    ),
    (
        'e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b',
        'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
        '10K Competitive',
        10.00,
        250000,
        500,
        1,
        true
    ) ON CONFLICT (id) DO NOTHING;

-- Seed auth.users for Admins (password is 'admin123')
INSERT INTO
    auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'admin.bedasrun@gmail.com',
        '$2a$12$e/z1vT39h9G8k.8z80KxyeB2/P8FhH4G/m.m7Q3UjH7l.V/kF.96G',
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Admin Fun Run"}',
        'authenticated',
        'authenticated'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'rina.koordinator@gmail.com',
        '$2a$12$e/z1vT39h9G8k.8z80KxyeB2/P8FhH4G/m.m7Q3UjH7l.V/kF.96G',
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Rina Koordinator"}',
        'authenticated',
        'authenticated'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'dedi.panitia@gmail.com',
        '$2a$12$e/z1vT39h9G8k.8z80KxyeB2/P8FhH4G/m.m7Q3UjH7l.V/kF.96G',
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Dedi Panitia"}',
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

-- Seed public.profiles (Admin roles)
INSERT INTO
    public.profiles (id, full_name, role)
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Admin Fun Run',
        'admin'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Rina Koordinator',
        'admin'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Dedi Panitia',
        'admin'
    ) ON CONFLICT (id) DO NOTHING;

-- Seed registrations
INSERT INTO
    public.registrations (
        id,
        registration_number,
        event_id,
        event_category_id,
        full_name,
        email,
        phone,
        nik,
        gender,
        birth_place,
        birth_date,
        nationality,
        address,
        blood_type,
        jersey_size,
        emergency_contact_name,
        emergency_contact_phone,
        registration_status,
        qr_code_token
    )
VALUES (
        '5c9e2b17-76df-4ee8-b2a6-06bb56dfa9c1',
        'BR2026-0001',
        'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
        'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a',
        'Budi Santoso',
        'budi.santoso@gmail.com',
        '081234567890',
        '3273012505900001',
        'male',
        'Bandung',
        '1990-05-25',
        'WNI',
        'Jl. Kebon Jeruk No. 12, Bandung',
        'O',
        'L',
        'Agus Santoso',
        '081298765432',
        'paid',
        'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'
    ),
    (
        '6d9e2b17-76df-4ee8-b2a6-06bb56dfa9c2',
        'BR2026-0002',
        'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
        'e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b',
        'Siti Rahayu Putri',
        'siti.rahayu@yahoo.co.id',
        '085678901234',
        '3273024612950002',
        'female',
        'Surabaya',
        '1995-12-06',
        'WNI',
        'Jl. Dharmahusada Indah No. 5, Surabaya',
        'A',
        'M',
        'Slamet Rahayu',
        '085612345678',
        'pending_payment',
        null
    ),
    (
        '7d9e2b17-76df-4ee8-b2a6-06bb56dfa9c3',
        'BR2026-0003',
        'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
        'e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b',
        'Andi Wijaya Kusuma',
        'andi.wk@outlook.com',
        '087890123456',
        '3273031708880003',
        'male',
        'Jakarta',
        '1988-08-17',
        'WNI',
        'Jl. Sudirman Kav. 21, Jakarta Pusat',
        'B',
        'XL',
        'Dewi Wijaya',
        '087812345678',
        'paid',
        'f2a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'
    ) ON CONFLICT (id) DO NOTHING;

-- Seed transactions
INSERT INTO
    public.transactions (
        id,
        registration_id,
        order_id,
        amount,
        payment_type,
        transaction_status,
        midtrans_transaction_id,
        snap_token,
        snap_redirect_url,
        paid_at,
        expired_at
    )
VALUES (
        '11111111-2222-3333-4444-555555555551',
        '5c9e2b17-76df-4ee8-b2a6-06bb56dfa9c1',
        'EVT-BR2026-0001-1731600000',
        150000,
        'qris',
        'settlement',
        'mid-tx-001',
        'snap-token-001',
        'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-001',
        '2026-10-01 10:15:00+07',
        null
    ),
    (
        '22222222-3333-4444-5555-666666666662',
        '6d9e2b17-76df-4ee8-b2a6-06bb56dfa9c2',
        'EVT-BR2026-0002-1731600100',
        250000,
        null,
        'pending',
        null,
        'snap-token-002',
        'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-002',
        null,
        null
    ),
    (
        '33333333-4444-5555-6666-777777777773',
        '7d9e2b17-76df-4ee8-b2a6-06bb56dfa9c3',
        'EVT-BR2026-0003-1731600200',
        250000,
        'bank_transfer',
        'settlement',
        'mid-tx-003',
        'snap-token-003',
        'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-003',
        '2026-10-02 14:30:00+07',
        null
    ) ON CONFLICT (id) DO NOTHING;