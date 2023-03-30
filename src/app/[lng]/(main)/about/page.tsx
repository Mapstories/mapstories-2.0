import { PageHeader } from '@/src/components/PageHeader'
import type { Metadata } from 'next/types'

export const metadata: Metadata = {
  title: 'About',
  openGraph: {
    title: 'About',
  },
}

export default function Page() {
  return (
    <div>
      <PageHeader heading="Über Mapstories"></PageHeader>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deleniti,
        voluptatum a molestiae itaque natus amet? Deleniti esse, ipsum placeat,
        inventore omnis dolore ducimus, fugit ipsam incidunt molestiae sunt
        accusamus nam! Lorem ipsum dolor sit amet consectetur, adipisicing elit.
        Deleniti, voluptatum a molestiae itaque natus amet? Deleniti esse, ipsum
        placeat, inventore omnis dolore ducimus, fugit ipsam incidunt molestiae
        sunt accusamus nam! Lorem ipsum dolor sit amet consectetur, adipisicing
        elit. Deleniti, voluptatum a molestiae itaque natus amet? Deleniti esse,
        ipsum placeat, inventore omnis dolore ducimus, fugit ipsam incidunt
        molestiae sunt accusamus nam!
      </p>
    </div>
  )
}
