import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedPaths = ["/dashboard"]
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // Rutas de autenticación (login, registro)
  const authPaths = ["/login", "/registro"]
  const isAuthPath = authPaths.includes(pathname)

  // Obtener token de diferentes fuentes posibles
  const token =
    request.cookies.get("auth_access_token")?.value ||
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("token")?.value

  // Si es una ruta protegida y no hay token, redirigir a login
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si es una ruta de auth y hay token, redirigir a dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - uploads folder (archivos subidos)
     * - dashboard/uploads (archivos de exámenes)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|videos|uploads|dashboard/uploads|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.pdf$|.*\\.doc$|.*\\.docx$|.*\\.zip$|.*\\.rar$|.*\\.dicom$).*)",
  ],
}
