import { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OrganizerBuyers from '@/components/organizer-buyers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Compradores | SorykPass',
  description: 'Visualiza los usuarios que han comprado tickets para tus eventos',
}

export default async function OrganizerBuyersPage() {
  const user = await requireAuth()

  if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5">
      <div className="container mx-auto px-4 py-8">
        <OrganizerBuyers />
      </div>
    </div>
  )
}
