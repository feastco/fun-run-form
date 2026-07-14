// js/db.js
// Mock database layer using localStorage

const DB_KEYS = {
  EVENT: 'bedas_run_event',
  CATEGORIES: 'bedas_run_categories',
  REGISTRATIONS: 'bedas_run_registrations',
  ADMIN_LOGGED_IN: 'bedas_run_admin_logged'
};

// Seed initial data if not present
function initDB() {
  // 1. Seed Event
  if (!localStorage.getItem(DB_KEYS.EVENT)) {
    const event = {
      name: "Bandung Bedas Run 2026",
      slug: "pendaftaran-bedas-run-2026-v3",
      date: "2026-09-06",
      deadline: "2026-08-17T23:59:59",
      status: "open"
    };
    localStorage.setItem(DB_KEYS.EVENT, JSON.stringify(event));
  }

  // 2. Seed Categories
  if (!localStorage.getItem(DB_KEYS.CATEGORIES)) {
    const categories = [
      { id: "5k-open-male", distance: "5K", type: "OPEN MALE", price: 200000, quota: 100, registered_count: 32 },
      { id: "5k-open-female", distance: "5K", type: "OPEN FEMALE", price: 200000, quota: 100, registered_count: 18 },
      { id: "5k-master-male", distance: "5K", type: "MASTER MALE", price: 200000, quota: 50, registered_count: 12 },
      { id: "5k-master-female", distance: "5K", type: "MASTER FEMALE", price: 200000, quota: 50, registered_count: 8 },
      
      { id: "10k-open-male", distance: "10K", type: "OPEN MALE", price: 250000, quota: 150, registered_count: 89 },
      { id: "10k-open-female", distance: "10K", type: "OPEN FEMALE", price: 250000, quota: 150, registered_count: 42 },
      { id: "10k-master-male", distance: "10K", type: "MASTER MALE", price: 250000, quota: 75, registered_count: 24 },
      { id: "10k-master-female", distance: "10K", type: "MASTER FEMALE", price: 250000, quota: 75, registered_count: 15 }
    ];
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  // 3. Seed Registrations (empty array if not exists)
  if (!localStorage.getItem(DB_KEYS.REGISTRATIONS)) {
    localStorage.setItem(DB_KEYS.REGISTRATIONS, JSON.stringify([]));
  }
}

// Get event info
function getEvent() {
  return JSON.parse(localStorage.getItem(DB_KEYS.EVENT));
}

// Get all categories
function getCategories() {
  return JSON.parse(localStorage.getItem(DB_KEYS.CATEGORIES)) || [];
}

// Update category quota (Admin feature)
function updateCategoryQuota(categoryId, newQuota) {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === categoryId);
  if (index !== -1) {
    categories[index].quota = parseInt(newQuota) || 0;
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
    return true;
  }
  return false;
}

// Get all registrations
function getRegistrations() {
  return JSON.parse(localStorage.getItem(DB_KEYS.REGISTRATIONS)) || [];
}

// Helper to check for duplicate registration (email or NIK already registered and active/paid)
function checkDuplicateRegistration(email, nik) {
  const registrations = getRegistrations();
  // Duplicate if email or NIK matches, and the registration is either paid or pending (not expired)
  const duplicate = registrations.find(r => 
    (r.buyer_email.toLowerCase() === email.toLowerCase() || r.nik === nik) &&
    (r.status === 'paid' || (r.status === 'pending' && new Date(r.expired_at) > new Date()))
  );
  return duplicate || null;
}

// Check category availability (quota remaining)
function getCategoryAvailability(categoryId) {
  const categories = getCategories();
  const category = categories.find(c => c.id === categoryId);
  if (!category) return { total: 0, reserved: 0, available: 0 };

  const registrations = getRegistrations();
  
  // Count paid registrations + pending registrations that haven't expired
  const activeBookings = registrations.filter(r => 
    r.category_id === categoryId &&
    (r.status === 'paid' || (r.status === 'pending' && new Date(r.expired_at) > new Date()))
  ).length;

  const available = Math.max(0, category.quota - activeBookings);
  return {
    total: category.quota,
    reserved: activeBookings,
    available: available
  };
}

// Create a new registration
function createRegistration(data) {
  initDB();
  const { category_id, buyer_name, buyer_phone, buyer_email, nik } = data;
  
  // 1. Quota check
  const availability = getCategoryAvailability(category_id);
  if (availability.available <= 0) {
    return { success: false, message: "Kuota untuk kategori ini sudah penuh." };
  }

  // 2. Duplicate check
  const duplicate = checkDuplicateRegistration(buyer_email, nik);
  if (duplicate) {
    return { 
      success: false, 
      message: "Data Anda (Email atau NIK) sudah terdaftar dalam sistem dan masih aktif.",
      existingCode: duplicate.registration_code
    };
  }

  // 3. Generate registration code & order ID
  const registrations = getRegistrations();
  const totalCount = registrations.length + 1;
  const regCode = `BDR-26-${String(totalCount).padStart(4, '0')}`;
  const orderId = `${regCode}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 4. Create registration entry
  const now = new Date();
  const expiredAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes to pay (for easy prototype testing)

  const newRegistration = {
    id: crypto.randomUUID ? crypto.randomUUID() : 'reg_' + Math.random().toString(36).substring(2, 9),
    category_id,
    registration_code: regCode,
    order_id: orderId,
    status: 'pending',
    buyer_name,
    buyer_phone,
    buyer_email,
    nik,
    jenis_kelamin: data.jenis_kelamin,
    tempat_lahir: data.tempat_lahir,
    tanggal_lahir: data.tanggal_lahir,
    nama_instansi: data.nama_instansi || '',
    kewarganegaraan: data.kewarganegaraan,
    alamat_provinsi: data.alamat_provinsi,
    alamat_kabupaten: data.alamat_kabupaten,
    alamat_kecamatan: data.alamat_kecamatan,
    alamat_desa: data.alamat_desa,
    alamat_detail: data.alamat_detail || '',
    ukuran_kaos: data.ukuran_kaos,
    golongan_darah: data.golongan_darah,
    riwayat_penyakit: data.riwayat_penyakit || '',
    kontak_darurat: data.kontak_darurat,
    relasi_kontak_darurat: data.relasi_kontak_darurat,
    payment_token: 'mock_token_' + Math.random().toString(36).substring(2, 12),
    created_at: now.toISOString(),
    expired_at: expiredAt.toISOString(),
    paid_at: null
  };

  registrations.push(newRegistration);
  localStorage.setItem(DB_KEYS.REGISTRATIONS, JSON.stringify(registrations));

  return { success: true, registration: newRegistration };
}

// Update registration payment status (e.g. simulated payment success or expiration)
function updateRegistrationStatus(registrationId, newStatus) {
  const registrations = getRegistrations();
  const index = registrations.findIndex(r => r.id === registrationId);
  if (index !== -1) {
    const reg = registrations[index];
    const oldStatus = reg.status;
    reg.status = newStatus;
    
    if (newStatus === 'paid') {
      reg.paid_at = new Date().toISOString();
      
      // Update registered count in category
      const categories = getCategories();
      const catIdx = categories.findIndex(c => c.id === reg.category_id);
      if (catIdx !== -1) {
        categories[catIdx].registered_count += 1;
        localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
      }
    }
    
    localStorage.setItem(DB_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    return true;
  }
  return false;
}

// Find registration by registration code, email, or phone
function findRegistration(query) {
  if (!query) return null;
  const registrations = getRegistrations();
  const cleanQuery = query.trim().toLowerCase();
  
  return registrations.find(r => 
    r.registration_code.toLowerCase() === cleanQuery ||
    r.buyer_email.toLowerCase() === cleanQuery ||
    r.buyer_phone === cleanQuery
  );
}

// Sweep expired transactions to release categories' quotas
function checkAndReleaseExpired() {
  const registrations = getRegistrations();
  const now = new Date();
  let updated = false;

  registrations.forEach(r => {
    if (r.status === 'pending' && new Date(r.expired_at) < now) {
      r.status = 'expired';
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem(DB_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  }
}

// Initialize database right away
initDB();
// Periodically check for expired transactions
setInterval(checkAndReleaseExpired, 30000);
