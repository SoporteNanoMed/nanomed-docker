"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, MapPin, Lightbulb, Users, Heart, Brain, Shield } from "lucide-react"
import { CliengoChat } from "@/components/cliengo-chat"

// Función para obtener el icono correspondiente a cada categoría
const getCategoriaIcon = (categoria) => {
  const iconMap = {
    "Evaluaciones de Salud": Heart,
    "Evaluaciones Psicolaborales": Brain,
    "Evaluaciones Laborales Preventivas de Riesgo de Enfermedad o Riesgo de Accidente": Shield,
  }
  
  return iconMap[categoria] || Heart // Fallback al corazón
}

export default function SaludOcupacionalPage() {
  return (
    <>
      <CliengoChat />
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#f0f6f7] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-5xl font-bold text-[#000000] mb-6">Salud ocupacional</h1>
              
              {/* Título principal con diseño elegante */}
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Cuidamos la <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">salud y seguridad</span> de tus trabajadores
                </h2>
              </div>

              {/* Descripción principal */}
              <div className="max-w-4xl mx-auto mb-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  En <span className="font-bold text-[#59c3ed]">nanoMED</span>, nos especializamos en Salud Ocupacional para la industria minera y empresas de alto riesgo.
                  Nuestro enfoque combina <span className="font-bold text-[#59c3ed]">tecnología avanzada, inteligencia artificial</span> y atención médica de primer nivel,
                  asegurando condiciones óptimas para la productividad y seguridad laboral.
                </p>
              </div>

              {/* Información adicional con diseño premium */}
              <div className="max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-full border border-[#59c3ed]/20">
                  <div className="w-2 h-2 bg-[#59c3ed] rounded-full"></div>
                  <p className="text-lg text-gray-700 font-medium">
                    Soluciones integrales de salud ocupacional con tecnología de vanguardia y cobertura nacional.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta con características */}
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-6xl">
                <div className="relative overflow-hidden bg-[#f0f6f7] rounded-3xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
                  {/* Efectos de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/5 via-transparent to-[#479cd0]/5"></div>
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-[#59c3ed]/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#479cd0]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#59c3ed]/5 rounded-full blur-3xl"></div>
                  </div>
                  
                  {/* Contenido de la tarjeta */}
                  <div className="relative z-10 px-8 py-16 md:px-12 md:py-20">
                    {/* Grid de características */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Evaluaciones completas */}
                      <div className="group relative h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                          <div className="flex items-start gap-4 h-full">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <Heart className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                                Evaluaciones completas
                              </h4>
                              <p className="text-gray-700 leading-relaxed text-justify">
                                <span className="font-semibold text-[#59c3ed]">Baterías preocupacionales</span> y evaluaciones médicas integrales para determinar la aptitud laboral.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Control preventivo */}
                      <div className="group relative h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                          <div className="flex items-start gap-4 h-full">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <Shield className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                                Control preventivo
                              </h4>
                              <p className="text-gray-700 leading-relaxed text-justify">
                                <span className="font-semibold text-[#59c3ed]">Exámenes de alcohol y drogas</span> con pruebas certificadas para detección y control preventivo.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Diagnóstico especializado */}
                      <div className="group relative h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                          <div className="flex items-start gap-4 h-full">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <Brain className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                                Diagnóstico especializado
                              </h4>
                              <p className="text-gray-700 leading-relaxed text-justify">
                                <span className="font-semibold text-[#59c3ed]">Polisomnografías y test de esfuerzo</span> para detectar trastornos del sueño y validar capacidad física.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cobertura nacional */}
                      <div className="group relative h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl h-full">
                          <div className="flex items-start gap-4 h-full">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <MapPin className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                                Cobertura nacional
                              </h4>
                              <p className="text-gray-700 leading-relaxed text-justify">
                                <span className="font-semibold text-[#59c3ed]">Exámenes en terreno</span> y evaluaciones móviles en faenas y lugares de trabajo.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Call to action */}
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <Shield className="w-5 h-5" />
                        <span>Salud ocupacional de vanguardia</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Principales */}
      <section className="py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título de sección */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Servicios <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Principales</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Soluciones integrales de salud ocupacional con tecnología de vanguardia para empresas de alto riesgo
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ServiceCard
                title="Baterías Preocupacionales"
                description="Evaluaciones médicas completas para determinar la aptitud laboral."
                image="/images/BateriasPreocupacionales.webp"
              />
              <ServiceCard
                title="Exámenes de Alcohol y Drogas"
                description="Pruebas certificadas de detección y control preventivo."
                image="/images/ExamenesDeAlcoholYDrogas.webp"
              />
              <ServiceCard
                title="Polisomnografías"
                description="Diagnóstico especializado para detectar trastornos del sueño y somnolencia."
                image="/images/Polisomnografias.webp" 
              />
              <ServiceCard
                title="Test de Esfuerzo"
                description="Evaluación cardiopulmonar para validar la capacidad física de los trabajadores."
                image="/images/TestDeEsfuerzo.webp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Principales */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ServiceCard
                title="Exámenes en Terreno"
                description="Evaluaciones médicas móviles en faenas y lugares de trabajo."
                image="/images/ExamenesEnTerreno.webp"
              />
              <ServiceCard
                title="Control de Fatiga y Somnolencia"
                description="Monitoreo en tiempo real para prevenir riesgos laborales."
                image="/images/ControlDeFatigaYSomnolencia.webp"
              />
              <ServiceCard
                title="Programas de Bienestar"
                description="Estrategias de salud física, mental y emocional para los trabajadores."
                image="/images/ProgramasDeBienestar.webp"
              />
              <ServiceCard
                title="Planes de Salud Mental"
                description="Atención psicológica y psiquiátrica, sesiones de telemedicina y apoyo emocional."
                image="/images/PlanesDeSaludMental.webp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Adicionales - Acordeón */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título de sección */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Servicios <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Adicionales</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Evaluaciones especializadas y soluciones complementarias para el bienestar integral de tus trabajadores
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {serviciosAdicionales.map((servicio, index) => (
                  <ServicioAccordion key={index} servicio={servicio} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cobertura Nacional */}
      <section className="py-16 bg-gradient-to-b from-[#f0f6f7] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título de sección */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Cobertura Nacional y <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Soluciones a la Medida</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Llegamos a cualquier ubicación del país con soluciones personalizadas para tu empresa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cobertura Nacional */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Cobertura Nacional
                        </h3>
                        <p className="text-sm text-[#59c3ed] font-semibold">en todo el país</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      <p className="text-gray-600 leading-relaxed text-justify">
                        Contamos con <span className="font-semibold text-[#59c3ed]">cobertura a nivel nacional</span>, adaptándonos a las necesidades de tu empresa
                        en cualquier ubicación.
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="w-8 h-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soluciones Personalizadas */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Lightbulb className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Soluciones Personalizadas
                        </h3>
                        <p className="text-sm text-[#59c3ed] font-semibold">a tu medida</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      <p className="text-gray-600 leading-relaxed text-justify">
                        <span className="font-semibold text-[#59c3ed]">Agenda una reunión con nuestro equipo</span>, y diseñaremos una solución personalizada sin
                        problemas.
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="w-8 h-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipo Comprometido */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Equipo Comprometido
                        </h3>
                        <p className="text-sm text-[#59c3ed] font-semibold">altamente apasionado</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      <p className="text-gray-600 leading-relaxed text-justify">
                        Somos un equipo humano <span className="font-semibold text-[#59c3ed]">altamente apasionado y comprometido</span> en satisfacer rápidamente
                        las exigencias de nuestros clientes.
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="w-8 h-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Image src="/images/webclip.png" alt="nanoMED" width={150} height={40} className="mb-4" />
              <p className="text-gray-400 mb-4 text-justify">
                En nanoMED Ilevamos salud de calidad a empresas y comunidades rurales, con tecnología avanzada y
                atención donde más se necesita.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/nanoMedcl"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/nanomed.clinica/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/nano-med-1/posts/?feedView=all/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/especialidades" className="text-gray-400 hover:text-white transition-colors">
                    Especialidades
                  </Link>
                </li>
                <li>
                  <Link href="/salud-ocupacional" className="text-gray-400 hover:text-white transition-colors">
                    Salud Ocupacional
                  </Link>
                </li>
                <li>
                  <Link href="/requisitos-examenes" className="text-gray-400 hover:text-white transition-colors">
                    Requisitos Exámenes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Imagenología
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Laboratorio
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Telemedicina
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Salud Ocupacional
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-gray-400">José Joaquín Pérez #240, Salamanca, Chile.</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-gray-400">+56 9 8828 9770</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-400 flex-shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="text-gray-400">contacto@nanomed.cl</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

function ServiceCard({ title, description, image }) {
  return (
    <div className="group relative h-full">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Tarjeta principal */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
        <div className="flex flex-col h-full">
          {/* Imagen */}
          <div className="relative mb-6">
            <div className="h-48 overflow-hidden rounded-2xl">
              <Image
                src={image || "/placeholder.svg"}
                alt={title}
                width={400}
                height={300}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {/* Overlay con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          </div>
          
          {/* Contenido */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300 text-center">
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-justify flex-1">
              {description}
            </p>
            
            {/* Indicador de hover */}
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServicioAccordion({ servicio }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Obtener el icono correspondiente a la categoría
  const IconComponent = getCategoriaIcon(servicio.categoria)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-4 text-left bg-[#f0f6f7] hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#59c3ed] rounded-full flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold">{servicio.categoria}</h4>
          </div>
          <p className="text-[#7b7b7b] mb-4 text-justify">{servicio.descripcion}</p>
        </div>
      )}
    </div>
  )
}

const serviciosAdicionales = [
  {
    nombre: "Batería Básica (Sin riesgo laboral)",
    categoria: "Evaluaciones de Salud",
    descripcion:
      "Esta batería de exámenes consiste en evaluar la condición de salud general del trabajador o postulante con el fin de entregar recomendaciones de salud si lo amerita. Esta batería, en general, no genera contraindicaciones para el cargo.",
  },
  {
    nombre: "Aversión al Riesgo",
    categoria: "Evaluaciones Psicolaborales",
    descripcion:
      "Dirigida a trabajadores que se encuentran expuestos a diversos riesgos dado a su actividad operativa, ambiente físico y/o geográfico donde se desenvuelvan. Permitiendo identificar, en función de sus predisposiciones de aprendizaje experiencial y conocimientos teórico - prácticos tendencias de este para asumir conductas de control o potenciadoras de riesgo.",
  },
  {
    nombre: "Altura Física",
    categoria: "Evaluaciones de Salud",
    descripcion:
      "Esta batería aplica para postulantes o trabajadores que se desempeñen laborales sobre 1,8 metro de altura respecto del suelo con posibilidad de caída libre. Usualmente es solicitada para labores que se realizan en andamios o plataformas, labores sobre estanques, operadores de grúas pluma, grúas torre, entre otras.",
  },
  {
    nombre: "Espacios Confinados",
    categoria: "Evaluaciones Laborales Preventivas de Riesgo de Enfermedad o Riesgo de Accidente",
    descripcion:
      "Esta batería aplica en aquellos casos de postulantes o trabajadores que deben desempeñarse en actividades laborales en cámaras subterráneas, al interior estanques, tinas, etc. que requieran equipos autónomos de suministro de oxígeno o aire comprimido.",
  },
  {
    nombre: "Anhidrido sulfuroso / Neblinas acidas",
    categoria: "Evaluaciones Laborales Preventivas de Riesgo de Enfermedad o Riesgo de Accidente",
    descripcion:
      "Batería que evalúa la condición de salud del individuo, que por su cargo presenta exposición a Anhídrido Sulfuroso.",
  },
  {
    nombre: "Polvos Neumoconiógenos",
    categoria: "Evaluaciones Laborales Preventivas de Riesgo de Enfermedad o Riesgo de Accidente",
    descripcion:
      "La neumoconiosis es la acumulación de polvo en los pulmones ya sean fibrogénicos (sílice, asbesto y talco) o no fibrogénicos (carbón). La exposición a estos polvos puede provocar silicosis y/o fibrosis pulmonar producto de la reacción inflamatoria a las sustancias.",
  },
  {
    nombre: "Operador de Equipo Fijo Parte Móvil",
    categoria: "Evaluaciones Laborales Preventivas de Riesgo de Enfermedad o Riesgo de Accidente",
    descripcion:
      "Batería aplica para postulantes o trabajadores que desempeñen el cargo de conductor u operador de equipo fijo parte móvil, con licencias D.",
  },
  {
    nombre: "Conductor de Vehículo u Operario de Maquinaria",
    categoria: "Evaluaciones Laborales Preventivas de Riesgo de Enfermedad o Riesgo de Accidente",
    descripcion:
      "Batería aplica para postulantes o trabajadores que desempeñen el cargo de conductor u operador de maquinaria.",
  },
  {
    nombre: "Psicosensotécnico",
    categoria: "Evaluaciones de Salud",
    descripcion:
      "Evaluación preocupacional dirigida a conductores, choferes, operadores de camión, maquinaria pesada, equipo de alto tonelaje y transporte de pasajeros.",
  },
  {
    nombre: "Ruido",
    categoria: "Evaluaciones Laborales Preventivas de Riesgo de Enfermedad o Riesgo de Accidente",
    descripcion:
      "Trabajador cuya exposición laboral a ruido estable o fluctuante es mayor 85 dB(A) lento, en una jornada laboral de 8 hrs. diarias. o exposición laboral a ruido impulsivo mayor 95 dB.",
  },
]
