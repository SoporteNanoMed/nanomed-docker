import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-10 w-[300px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de perfil */}
        <Skeleton className="h-[400px] rounded-lg" />

        {/* Formulario de información personal */}
        <div className="md:col-span-2">
          <Skeleton className="h-[400px] rounded-lg" />
        </div>

        {/* Contacto de emergencia */}
        <div className="md:col-span-3">
          <Skeleton className="h-[150px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}
