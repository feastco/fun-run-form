import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface CategoryCardProps {
  id: string
  name: string
  distanceKm: number
  price: number
  quota: number
  availableSlots: number
  isRegistrationOpen: boolean
}

export function CategoryCard({
  id,
  name,
  distanceKm,
  price,
  quota,
  availableSlots,
  isRegistrationOpen,
}: CategoryCardProps) {
  const isSoldOut = availableSlots <= 0

  return (
    <div className="bg-white border border-[#F3F4F6] rounded-card p-6 shadow-default hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-text-primary">{name}</h3>
          <span className="bg-primary/10 text-primary text-[12px] font-semibold px-3 py-1 rounded-full">
            {distanceKm}K
          </span>
        </div>
        
        <p className="text-2xl font-extrabold text-primary mb-6">
          {formatCurrency(price)}
        </p>

        <div className="space-y-2 mb-8">
          <div className="flex justify-between text-[14px]">
            <span className="text-text-secondary">Total Kuota:</span>
            <span className="font-semibold text-text-primary">{quota} Slot</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-text-secondary">Sisa Kuota:</span>
            {isSoldOut ? (
              <span className="text-danger font-bold uppercase text-[12px] bg-danger/10 px-2 py-0.5 rounded-full">Habis</span>
            ) : (
              <span className="text-success font-semibold">{availableSlots} Slot</span>
            )}
          </div>
        </div>
      </div>

      <div>
        {isSoldOut ? (
          <Button variant="primary" disabled className="w-full">
            Habis Terjual
          </Button>
        ) : !isRegistrationOpen ? (
          <Button variant="primary" disabled className="w-full">
            Pendaftaran Ditutup
          </Button>
        ) : (
          <Link href={`/daftar?category_id=${id}`} className="w-full block">
            <Button variant="primary" className="w-full">
              Daftar Kategori
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
