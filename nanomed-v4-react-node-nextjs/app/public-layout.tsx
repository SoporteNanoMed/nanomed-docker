import type { ReactNode } from "react"
import { CliengoChat } from "@/components/cliengo-chat"

interface PublicLayoutProps {
  children: ReactNode
}

function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <CliengoChat />
      {children}
    </>
  )
}

export default PublicLayout
