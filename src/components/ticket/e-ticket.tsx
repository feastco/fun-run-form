'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface ETicketProps {
  fullName: string
  registrationNumber: string
  eventName: string
  categoryName: string
  qrCodeToken: string
}

export function ETicket({
  fullName,
  registrationNumber,
  eventName,
  categoryName,
  qrCodeToken,
}: ETicketProps) {
  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${qrCodeToken}`
    : ''

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 max-w-md mx-auto shadow-elevated print:shadow-none print:border-none print:max-w-full print:p-0">
      {/* Header */}
      <div className="text-center pb-6 border-b-2 border-dashed border-gray-200">
        <h3 className="text-xl font-extrabold tracking-tight text-secondary">
          FUN<span className="text-primary">RUN</span>
        </h3>
        <p className="text-xs text-text-secondary uppercase mt-1 font-semibold tracking-wider">
          Official E-Ticket
        </p>
      </div>

      {/* Ticket Details */}
      <div className="py-6 space-y-4 text-sm">
        <div>
          <span className="text-xs text-text-secondary uppercase font-semibold">Nama Peserta</span>
          <p className="text-base font-bold text-text-primary mt-0.5">{fullName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-text-secondary uppercase font-semibold">Nomor Registrasi</span>
            <p className="text-base font-bold text-primary mt-0.5">{registrationNumber}</p>
          </div>
          <div>
            <span className="text-xs text-text-secondary uppercase font-semibold">Kategori</span>
            <p className="text-base font-bold text-text-primary mt-0.5">{categoryName}</p>
          </div>
        </div>

        <div>
          <span className="text-xs text-text-secondary uppercase font-semibold">Event</span>
          <p className="text-base font-bold text-text-primary mt-0.5">{eventName}</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center justify-center py-6 border-t-2 border-dashed border-gray-200">
        {verifyUrl ? (
          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
            <QRCodeSVG value={verifyUrl} size={160} level="H" includeMargin={false} />
          </div>
        ) : (
          <div className="w-[160px] h-[160px] bg-gray-100 rounded-xl animate-pulse" />
        )}
        <p className="text-[11px] text-text-secondary mt-3 text-center">
          Pindai QR Code di atas saat pengambilan race pack untuk verifikasi pendaftaran.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 print:hidden">
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 h-11 bg-secondary text-white rounded-lg hover:bg-opacity-95 font-bold transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak Tiket
        </button>
      </div>
    </div>
  )
}
