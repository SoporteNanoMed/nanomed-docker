"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ChevronDown, 
  Stethoscope, 
  Building2, 
  MessageCircle, 
  Zap, 
  Building, 
  Clock, 
  Users, 
  Activity, 
  Heart, 
  Volume2, 
  Apple, 
  Baby, 
  Brain, 
  Smile, 
  HeartHandshake, 
  Bone, 
  Sun, 
  Eye, 
  Flower, 
  Dumbbell, 
  Moon,
  CreditCard,
  Laptop,
  MapPin,
  Shield
} from "lucide-react"
import { CliengoChat } from "@/components/cliengo-chat"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { Button } from "@/components/ui/button"

// Función para obtener el icono correspondiente a cada especialidad
const getEspecialidadIcon = (nombre) => {
  const iconMap = {
    "Medicina General": Stethoscope,
    "Kinesiología": Activity,
    "Kinesiología de Piso Pélvico": Flower,
    "Fonoaudiología": Volume2,
    "Nutrición": Apple,
    "Matrona": Baby,
    "Psicología Adulta": Brain,
    "Pediatría": Smile,
    "Psicología Infanto-Juvenil": Users,
    "Medicina Interna": HeartHandshake,
    "Traumatología y Ortopedia": Bone,
    "Cardiología": Heart,
    "Dermatología": Sun,
    "Neurología": Brain,
    "Oftalmología": Eye,
    "Ginecología": Flower,
    "Psiquiatría Pediátrica y Adolescencia": Users,
    "Psiquiatría Adulto": Brain,
    "Nutrición Deportiva": Dumbbell,
    "Terapia del Sueño": Moon,
  }
  
  return iconMap[nombre] || Stethoscope // Fallback al estetoscopio
}

// Función para formatear precios
const formatPrice = (price) => {
  if (price === "próximamente") {
    return price
  }
  return `$${price}`
}

export default function EspecialidadesMedicasPage() {
  const especialidades = [
    {
      nombre: "Medicina General",
      costo: "30.000",
      costoPresencialParticular: "30.000",
      telemedicinaParticular: "30.000",
      costoPresencialFonasa: "7.750",
      telemedicinaFonasa: "6.580",
      descripcion: "Consulta integral para diagnóstico, prevención y tratamiento de enfermedades comunes.",
    },
    {
      nombre: "Kinesiología",
      costo: "30.000",
      costoPresencialParticular: "30.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion:
        "Rehabilitación física para mejorar la movilidad, recuperación de lesiones y fortalecimiento muscular.",
    },
    {
      nombre: "Kinesiología de Piso Pélvico",
      costo: "25.000",
      costoPresencialParticular: "25.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion:
        "Terapia especializada para fortalecer y mejorar la función del suelo pélvico, ideal para postparto y control de incontinencia.",
    },
    {
      nombre: "Fonoaudiología",
      costo: "35.000",
      costoPresencialParticular: "35.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Tratamiento de trastornos del habla, lenguaje y audición en niños y adultos.",
    },
    {
      nombre: "Nutrición",
      costo: "35.000",
      costoPresencialParticular: "30.000",
      telemedicinaParticular: "35.000",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion:
        "Planes personalizados para mejorar hábitos alimenticios, manejo de peso y control de enfermedades metabólicas.",
    },
    {
      nombre: "Matrona",
      costo: "30.000",
      costoPresencialParticular: "30.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Atención en salud femenina, embarazo, parto y postparto.",
    },
    {
      nombre: "Psicología Adulta",
      costo: "40.000",
      costoPresencialParticular: "40.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Terapia especializada para tratar ansiedad, depresión, estrés y otros trastornos emocionales.",
    },
    {
      nombre: "Pediatría",
      costo: "45.000",
      costoPresencialParticular: "45.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Control de salud infantil con seguimiento especializado del desarrollo y bienestar de los niños.",
    },
    {
      nombre: "Psicología Infanto-Juvenil",
      costo: "45.000",
      costoPresencialParticular: "45.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Evaluación y terapia para niños y adolescentes, abordando dificultades emocionales y conductuales.",
    },
    {
      nombre: "Medicina Interna",
      costo: "45.000",
      costoPresencialParticular: "45.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Atención médica especializada en enfermedades crónicas y control de salud preventiva en adultos.",
    },
    {
      nombre: "Traumatología y Ortopedia",
      costo: "45.000",
      costoPresencialParticular: "45.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion:
        "Diagnóstico y tratamiento de lesiones musculoesqueléticas, fracturas y recuperación postquirúrgica.",
    },
    {
      nombre: "Cardiología",
      costo: "55.000",
      costoPresencialParticular: "55.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Chequeo cardiovascular, detección de factores de riesgo y prevención de enfermedades del corazón.",
    },
    {
      nombre: "Dermatología",
      costo: "55.000",
      costoPresencialParticular: "55.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Evaluación y tratamiento de enfermedades de la piel, incluyendo acné, alergias y cáncer de piel.",
    },
    {
      nombre: "Neurología",
      costo: "55.000",
      costoPresencialParticular: "55.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion:
        "Atención especializada para enfermedades del sistema nervioso como migrañas, epilepsia y enfermedades neurodegenerativas.",
    },
    {
      nombre: "Oftalmología",
      costo: "55.000",
      costoPresencialParticular: "55.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Diagnóstico y tratamiento de enfermedades oculares como miopía, astigmatismo y glaucoma.",
    },
    {
      nombre: "Ginecología",
      costo: "55.000",
      costoPresencialParticular: "45.000",
      telemedicinaParticular: "55.000",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Salud integral femenina, incluyendo fertilidad, control ginecológico y menopausia.",
    },
    {
      nombre: "Psiquiatría Pediátrica y Adolescencia",
      costo: "70.000",
      costoPresencialParticular: "70.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Atención en salud mental infantil y juvenil con enfoque en desarrollo emocional y conductual.",
    },
    {
      nombre: "Psiquiatría Adulto",
      costo: "80.000",
      costoPresencialParticular: "80.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion: "Evaluación y tratamiento de trastornos psiquiátricos con opciones terapéuticas y farmacológicas.",
    },
    {
      nombre: "Nutrición Deportiva",
      costo: "40.000",
      costoPresencialParticular: "40.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion:
        "Asesoría nutricional especializada para deportistas, optimizando el rendimiento físico y la recuperación muscular.",
    },
    {
      nombre: "Terapia del Sueño",
      costo: "40.000",
      costoPresencialParticular: "40.000",
      telemedicinaParticular: "próximamente",
      costoPresencialFonasa: "próximamente",
      telemedicinaFonasa: "próximamente",
      descripcion:
        "Diagnóstico y tratamiento de trastornos del sueño como insomnio, apnea del sueño, síndrome de piernas inquietas y fatiga crónica.",
    },
  ]

  return (
    <main className="flex flex-col min-h-screen">
      <CliengoChat />
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#f0f6f7] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              {/* Título principal con diseño elegante */}
              <h1 className="text-3xl md:text-5xl font-bold text-[#000000] mb-6">Especialidades médicas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">nanoMED</span></h1>
              {/* Descripción principal */}
              <div className="max-w-4xl mx-auto mb-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                 Combinamos tecnología de vanguardia Inteligencia artificial y telemedicina para ofrecer 
                  <span className="font-bold text-[#59c3ed]"> atención médica sin límites</span>
                </p>
              </div>

              {/* Información adicional con diseño premium */}
              <div className="max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-full border border-[#59c3ed]/20">
                  <div className="w-2 h-2 bg-[#59c3ed] rounded-full"></div>
                  <p className="text-lg text-gray-700 font-medium">
                    Consulta híbrida presencial en nanoMED o en tu casa vía telemedicina con especialistas expertos + IA aplicada al diagnóstico.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta con características */}
            <div className="flex justify-center mb-16">
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
                      {/* Diagnósticos precisos */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <Activity className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                                Diagnósticos precisos
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                Diagnósticos más rápidos y precisos con nuestra 
                                <span className="font-semibold text-[#59c3ed]"> plataforma avanzada </span> 
                                impulsada por IA.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Atención integral */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <Building className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                                Atención integral
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                <span className="font-semibold text-[#59c3ed]">Consultas médicas + exámenes + procedimientos </span> 
                                en un solo lugar para tu comodidad.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sin esperas */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <Clock className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                                Sin esperas
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                Velocidad y 
                                <span className="font-semibold text-[#59c3ed]"> sin esperar semanas </span> 
                                para poder atenderte con tu especialista.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Equipo especializado */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <Users className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                                Equipo especializado
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                <span className="font-semibold text-[#59c3ed]">Equipo médico especializado </span> 
                                que te orienta y acompaña durante toda tu vida.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Call to action */}
                    <div className="mt-12 text-center">
                      <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <Heart className="w-5 h-5" />
                        <span>Tecnología al servicio de tu salud</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Consulta médica 24/7 */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Stethoscope className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Consulta médica general
                        </h3>
                        <p className="text-sm text-[#59c3ed] font-semibold">vía telemedicina 24/7</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      <p className="text-gray-600 leading-relaxed text-justify">
                        Acceso inmediato a profesionales de la salud cuando más lo necesitas, 
                        <span className="font-semibold text-[#59c3ed]"> sin salir de casa</span>.
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <Link
                        href="https://nanomed.mediclic.cl/espOD/Medicina-General/chile"
                        className="block w-full py-4 px-6 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white text-center rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        target="_blank"
                      >
                        <span>Médico al instante en menos de 5 minutos!</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Planes empresariales */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Optimiza la salud de tu empresa
                        </h3>
                        <p className="text-sm text-[#59c3ed] font-semibold">planes exclusivos</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      <p className="text-gray-600 leading-relaxed text-justify">
                        Soluciones integrales de salud ocupacional para 
                        <span className="font-semibold text-[#59c3ed]"> empresas de todos los tamaños</span>, 
                        cuidando el bienestar de tus colaboradores.
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <Link
                        href="https://api.whatsapp.com/send?phone=56988289770"
                        className="block w-full py-4 px-6 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white text-center rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        target="_blank"
                      >
                        <span>Solicita tu cotización ahora!</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asesoría WhatsApp */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#59c3ed] transition-colors duration-300">
                          Habla con un asesor
                        </h3>
                        <p className="text-sm text-[#59c3ed] font-semibold">en todo momento por WhatsApp</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      <p className="text-gray-600 leading-relaxed text-justify">
                        Nuestro equipo de especialistas está disponible 
                        <span className="font-semibold text-[#59c3ed]"> 24/7 </span> 
                        para resolver todas tus dudas y brindarte la mejor atención.
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <Link
                        href="https://api.whatsapp.com/send?phone=56988289770"
                        className="block w-full py-4 px-6 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white text-center rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        target="_blank"
                      >
                        <span>Recibe ayuda al instante!</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades Section */}
      <section className="pt-2 pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título de sección */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Conoce nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">servicios</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Especialidades médicas integrales con tecnología de vanguardia para tu salud y bienestar
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {especialidades.map((especialidad, index) => (
                  <EspecialidadAccordion key={index} especialidad={especialidad} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-12 bg-[#f0f6f7]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-xl md:text-2xl font-semibold text-[#59c3ed] text-center">
              nanoMED es más que un centro médico, somos pioneros en acompañamiento y asesoramiento médico para
              optimizar tu salud o las de tus trabajadores.
            </blockquote>
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
    </main>
  )
}

function EspecialidadAccordion({ especialidad }) {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  
  // Obtener el icono correspondiente a la especialidad
  const IconComponent = getEspecialidadIcon(especialidad.nombre)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-4 text-left bg-[#f0f6f7] hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold">{especialidad.nombre}</h3>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {/* Descripción de la especialidad */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-[#59c3ed] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <p className="text-[#000000] flex-1">{especialidad.descripcion}</p>
          </div>
          
                    {/* Tarifas disponibles */}
          <div className="mb-6">
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-800">Tarifas Disponibles</h4>
            </div>
            
            <div className={`grid gap-6 ${especialidad.costoPresencialFonasa !== "próximamente" && especialidad.telemedicinaFonasa !== "próximamente" ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Particular */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-blue-700">Particular</h5>
                      <p className="text-xs text-blue-600/70">Pago directo</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-100/50">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-700">Presencial</span>
                      </div>
                      <span className="font-bold text-blue-700 text-lg">
                        {formatPrice(especialidad.costoPresencialParticular)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-100/50">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-700">Telemedicina</span>
                      </div>
                      <span className="font-bold text-blue-700 text-lg">
                        {formatPrice(especialidad.telemedicinaParticular)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FONASA - Solo se muestra si no es "próximamente" */}
              {(especialidad.costoPresencialFonasa !== "próximamente" || especialidad.telemedicinaFonasa !== "próximamente") && (
                <div className="group relative bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-green-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-emerald-700">FONASA</h5>
                        <p className="text-xs text-emerald-600/70">Sistema público</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {especialidad.costoPresencialFonasa !== "próximamente" && (
                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-emerald-100/50">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-gray-700">Presencial</span>
                          </div>
                          <span className="font-bold text-emerald-700 text-lg">
                            {formatPrice(especialidad.costoPresencialFonasa)}
                          </span>
                        </div>
                      )}
                      
                      {especialidad.telemedicinaFonasa !== "próximamente" && (
                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-emerald-100/50">
                          <div className="flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-gray-700">Telemedicina</span>
                          </div>
                          <span className="font-bold text-emerald-700 text-lg">
                            {formatPrice(especialidad.telemedicinaFonasa)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Nota informativa */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> Los precios pueden variar según la modalidad de atención. Para mayor información contacte directamente con nuestro centro médico.
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="font-semibold mb-3">Agende con nosotros:</p>
            
            {/* Botones de acceso a plataforma */}
            <div className="mb-6 p-6 bg-gradient-to-br from-[#59c3ed]/5 to-[#479cd0]/5 rounded-2xl border border-[#59c3ed]/20 relative overflow-hidden">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 via-transparent to-[#479cd0]/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#59c3ed]/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">¡Agenda tu cita ahora!</h4>
                    <p className="text-sm text-gray-600">Acceso rápido y seguro a nuestra plataforma</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Puede agendar una cita fácilmente registrándose en nuestra plataforma o iniciando sesión si ya tiene una cuenta:
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {isAuthenticated ? (
                    <Link 
                      href="/dashboard"
                      className="group relative flex-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ir a mi Panel de Control</span>
                    </Link>
                  ) : (
                    <>
                      <Link 
                        href="/registro"
                        className="group relative flex-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Crear cuenta nueva</span>
                      </Link>
                      
                      <Link 
                        href="/login"
                        className="group relative flex-1 bg-white border-2 border-[#59c3ed] text-[#59c3ed] hover:bg-[#59c3ed] hover:text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Iniciar sesión</span>
                      </Link>
                    </>
                  )}
                </div>
                
                {/* Call to action adicional */}
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-[#59c3ed]/20">
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-semibold text-[#59c3ed]">¡Es rápido y seguro!</span> Solo toma 2 minutos
                  </p>
                </div>
              </div>
            </div>

            {/* Información de contacto tradicional */}
            <div className="border-t border-gray-200 pt-6">
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  O contáctenos directamente
                </h5>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Nuestro equipo está disponible para atenderle por múltiples canales
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Teléfono */}
                <div className="group bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Llámanos las 24 horas</p>
                      <a 
                        href="tel:+56988289770" 
                        className="text-lg font-bold text-blue-700 hover:text-blue-800 transition-colors duration-200 flex items-center gap-2 group"
                      >
                        +56 9 8828 9770
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Correo */}
                <div className="group bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Escríbenos por correo</p>
                      <a 
                        href="mailto:contacto@nanomed.cl" 
                        className="text-lg font-bold text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2 group"
                      >
                        contacto@nanomed.cl
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div className="group bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <a 
                    href="https://maps.app.goo.gl/Y7BvtvpV1nHjDC8Q8" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Visítanos en nuestras instalaciones</p>
                      <p className="text-lg font-bold text-purple-700 leading-tight group-hover:text-purple-800 transition-colors duration-200">
                        José Joaquín Pérez #240<br />
                        <span className="text-base font-medium text-purple-600 group-hover:text-purple-700 transition-colors duration-200">Salamanca, Chile</span>
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                </div>
              </div>
              
              {/* Call to action adicional */}
              <div className="mt-6 p-4 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 border border-[#59c3ed]/20 rounded-xl text-center">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold text-[#59c3ed]">¿Tienes dudas?</span> Nuestro equipo especializado está listo para ayudarte
                </p>
                <p className="text-xs text-gray-600">
                  Horario de atención: Lunes a Viernes 8:00 - 18:00 hrs
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}