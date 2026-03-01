import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import MisQRsView from '@/components/mis-qrs-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis QRs | SorykPass',
  description: 'Muestra tu código QR al validador para ingresar al evento',
}

export default async function MisQRsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return <MisQRsView />
}
