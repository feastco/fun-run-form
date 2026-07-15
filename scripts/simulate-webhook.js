const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const regNumber = process.argv[2];

if (!regNumber) {
  console.error('Error: Masukkan nomor registrasi sebagai argumen. Contoh: node scripts/simulate-webhook.js BE2026-0005');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const serverKey = process.env.MIDTRANS_SERVER_KEY;

if (!supabaseUrl || !supabaseServiceKey || !serverKey) {
  console.error('Error: Env vars tidak lengkap. Pastikan file .env berisi NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan MIDTRANS_SERVER_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    // 1. Fetch transaction linked to the registration number
    console.log(`[Simulasi Webhook] Mencari transaksi untuk nomor registrasi: ${regNumber}...`);
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .select('id, transactions(order_id, amount)')
      .eq('registration_number', regNumber)
      .single();

    if (regError || !regData) {
      console.error('Error: Pendaftaran tidak ditemukan.', regError);
      return;
    }

    const tx = regData.transactions?.[0];
    if (!tx) {
      console.error('Error: Tidak ada transaksi yang terhubung dengan pendaftaran ini.');
      return;
    }

    const orderId = tx.order_id;
    const statusCode = '200';
    const grossAmount = String(tx.amount);
    
    // 2. Calculate signature: SHA512(order_id + status_code + gross_amount + server_key)
    const payloadString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const signatureKey = crypto.createHash('sha512')
      .update(payloadString)
      .digest('hex');

    // 3. Prepare webhook payload
    const webhookPayload = {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: 'settlement',
      payment_type: 'gopay',
      transaction_id: `mock-tx-${Date.now()}`,
      fraud_status: 'accept'
    };

    console.log('[Simulasi Webhook] Mengirim POST request ke http://localhost:3000/api/v1/payments/notification...');
    
    const response = await fetch('http://localhost:3000/api/v1/payments/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });

    const resJson = await response.json();
    console.log(`[Simulasi Webhook] Response Status: ${response.status}`);
    console.log('[Simulasi Webhook] Response Body:', resJson);

    if (response.ok && resJson.success) {
      console.log('\n✅ BERHASIL! Status pendaftaran di local database seharusnya sudah terupdate menjadi "paid" (Lunas). Silakan refresh halaman status.');
    } else {
      console.error('\n❌ GAGAL memproses webhook.');
    }

  } catch (error) {
    console.error('Error saat menjalankan simulasi:', error);
  }
}

run();
