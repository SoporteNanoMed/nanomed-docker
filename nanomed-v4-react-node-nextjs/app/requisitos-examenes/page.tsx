"use client"

import {
  FileText,
  Glasses,
  Clock,
  Droplet,
  Pill,
  Phone,
  Calendar,
  TestTube,
  Brain,
  AlertTriangle,
  FileCheck,
  Wind,
  Activity,
  Cigarette,
  Shirt,
  Volume2,
  Smartphone,
  Ear,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"

// Componente RequisitoCard moderno
function RequisitoCard({ title, description, icon: Icon }) {
  return (
    <div className="group relative h-full">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Tarjeta principal */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-2xl h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                {title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-justify flex-1">
                {description}
              </p>
            </div>
          </div>
          
          {/* Indicador de hover */}
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-1 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RequisitosExamenes() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#f0f6f7] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-2">
              <h1 className="text-3xl md:text-5xl font-bold text-[#000000] mb-6">Requisitos de exámenes</h1>
              
              {/* Título principal con diseño elegante */}
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Preparación completa para garantizar una <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">atención ágil</span> y sin inconvenientes
                </h2>
              </div>

              {/* Descripción principal */}
              <div className="max-w-4xl mx-auto mb-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  Conoce todo lo que necesitas saber para la preparación de tus <span className="font-bold text-[#59c3ed]">exámenes médicos y ocupacionales</span>,
                  asegurando resultados precisos y una experiencia óptima en <span className="font-bold text-[#59c3ed]">nanoMED</span>.
                </p>
              </div>

              {/* Información adicional con diseño premium */}
              <div className="max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#59c3ed]/10 to-[#479cd0]/10 rounded-full border border-[#59c3ed]/20">
                  <div className="w-2 h-2 bg-[#59c3ed] rounded-full"></div>
                  <p className="text-lg text-gray-700 font-medium">
                    Preparación adecuada para resultados confiables y precisos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-2">
        {/* Alerta de higiene */}
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800 font-semibold">Recordatorio importante</AlertTitle>
          <AlertDescription className="text-blue-700">
            Recuerda también cuidar tu higiene personal antes de asistir a tus exámenes.
          </AlertDescription>
        </Alert>

        {/* Requisitos generales para exámenes de sangre */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <Droplet className="h-7 w-7 text-cyan-600 mr-3" />
            Requisitos generales para baterías y exámenes de sangre
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RequisitoCard
              title="Cédula de identidad"
              description="Traer cédula de identidad vigente."
              icon={FileText}
            />
            <RequisitoCard
              title="Lentes ópticos"
              description="Traer lentes ópticos, en caso de utilizar."
              icon={Glasses}
            />
            <RequisitoCard
              title="Ayuno"
              description="Ayuno mínimo 8 horas y máximo 10 horas."
              icon={Clock}
            />
            <RequisitoCard
              title="Hidratación"
              description="Se prohíbe la ingesta de líquidos durante el período preanalítico para garantizar la validez de los resultados de laboratorio."
              icon={Droplet}
            />
            <RequisitoCard
              title="Medicamentos"
              description="Los pacientes en tratamiento farmacológico deben portar sus medicamentos habituales y administrarlos posterior a la extracción sanguínea. La institución facilitará agua potable para la administración de los fármacos."
              icon={Pill}
            />
          </div>
        </div>

        {/* Tabla de ventana de alimentación */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-gray-700">
            Ventana de alimentación sugerida para respetar ayuno
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="text-white" style={{ backgroundColor: "#0797b3" }}>
                  <th className="p-4 text-left">Bloque horario agendado para toma de exámenes</th>
                  <th className="p-4 text-left">Para cumplir con el ayuno, su última comida debe ser:</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b border-gray-200">
                  <td className="p-4 font-medium">8:00 hrs.</td>
                  <td className="p-4">Entre las 22:00 hrs. y 00:00 hrs.</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4 font-medium">9:00 hrs.</td>
                  <td className="p-4">Entre las 23:00 hrs. y 01:00 hrs.</td>
                </tr>
                <tr className="bg-white border-b border-gray-200">
                  <td className="p-4 font-medium">10:00 hrs.</td>
                  <td className="p-4">Entre las 00:00 hrs. y 02:00 hrs.</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4 font-medium">11:00 hrs.</td>
                  <td className="p-4">Entre las 01:00 hrs. y 03:00 hrs.</td>
                </tr>
                <tr className="bg-white border-b border-gray-200">
                  <td className="p-4 font-medium">12:00 hrs.</td>
                  <td className="p-4">Entre las 02:00 hrs. y 04:00 hrs.</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium">13:00 hrs.</td>
                  <td className="p-4">Entre las 03:00 hrs. y 05:00 hrs.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Test de drogas y alcohol - Saliva */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <TestTube className="h-7 w-7 text-cyan-600 mr-3" />
            Test de drogas y alcohol: muestra saliva
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RequisitoCard
              title="Cédula de identidad"
              description="Cédula de identidad vigente."
              icon={FileText}
            />
            <RequisitoCard
              title="Medicamentos"
              description="Si toma medicamentos, tómelos normalmente (no discontinuar su uso)."
              icon={Pill}
            />
            <RequisitoCard
              title="Certificado médico"
              description="Si está en tratamiento con medicamentos que puedan afectar los resultados, traiga un certificado médico que detalle el diagnóstico y tratamiento, explicitando posibles falsos positivos."
              icon={FileCheck}
            />
          </div>
        </div>

        {/* Test de drogas y alcohol - Orina */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <TestTube className="h-7 w-7 text-cyan-600 mr-3" />
            Test de drogas y alcohol: muestra orina
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RequisitoCard
              title="Cédula de identidad"
              description="Cédula de identidad vigente."
              icon={FileText}
            />
            <RequisitoCard
              title="Medicamentos"
              description="Si toma medicamentos, tómelos normalmente (no discontinuar su uso)."
              icon={Pill}
            />
            <RequisitoCard
              title="Certificado médico"
              description="Si está en tratamiento con medicamentos que puedan afectar los resultados, traiga un certificado médico que detalle el diagnóstico y tratamiento, explicitando posibles falsos positivos."
              icon={FileCheck}
            />
          </div>

          {/* Requisitos adicionales para test de drogas y alcohol - Orina */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <RequisitoCard
              title="Restricción de líquidos"
              description="No ingerir más de 600 cc (3 vasos) de agua o líquidos durante las 2 horas previas al examen."
              icon={Droplet}
            />
            <RequisitoCard
              title="Evitar orinar"
              description="Evite orinar antes del examen. Esto facilitará una atención más rápida."
              icon={AlertTriangle}
            />
            <RequisitoCard
              title="Evitar alcohol"
              description="Evite alimentos y/o líquidos que contengan alcohol o que puedan fermentar."
              icon={AlertTriangle}
            />
          </div>
        </div>

        {/* Evaluaciones psicológicas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <Brain className="h-7 w-7 text-cyan-600 mr-3" />
            Evaluaciones psicológicas y psicosensotécnicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <RequisitoCard
              title="Cédula de identidad"
              description="Cédula de identidad vigente."
              icon={FileText}
            />
            <RequisitoCard
              title="Lentes ópticos"
              description="Traer lentes ópticos, en caso de usar."
              icon={Glasses}
            />
            <RequisitoCard
              title="Licencia de conducir"
              description="Licencia de conducir municipal vigente."
              icon={FileCheck}
            />
            <RequisitoCard
              title="Competencias básicas"
              description="Saber leer y escribir (acudir con traductor en caso de no hablar español)."
              icon={Brain}
            />
          </div>
        </div>

        {/* Exámenes de Espacios Confinados, Buzo e Hiperbaria */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <Wind className="h-7 w-7 text-cyan-600 mr-3" />
            Examen de Espacios Confinados, Examen Buzo (Hiperbaria), Exposición a Polvos Neumoconiógenos o Sílice
          </h2>

          {/* Requisitos generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <RequisitoCard
              title="Cédula de identidad"
              description="Cédula de identidad vigente."
              icon={FileText}
            />
            <RequisitoCard
              title="Medicamentos esenciales"
              description="Si toma medicamentos para hipertensión arterial, diabetes mellitus, hipotiroidismo, epilepsia, debe tomarlos normalmente (no descontinuar su uso)."
              icon={Pill}
            />
            <RequisitoCard
              title="Actividad física"
              description="No realizar actividad física al menos en los 30 minutos previos al examen."
              icon={Activity}
            />
            <RequisitoCard
              title="No fumar o vapear"
              description="No fumar o vapear al menos una hora antes del examen."
              icon={Cigarette}
            />
            <RequisitoCard
              title="Vestimenta"
              description="Acudir sin ropa ajustada (ej. fajas)."
              icon={Shirt}
            />
          </div>

          {/* Alerta sobre broncodilatadores */}
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-semibold">Importante - Tratamiento broncodilatador</AlertTitle>
            <AlertDescription className="text-amber-700">
              En caso de usar tratamiento broncodilatador, lo debe suspender el tiempo indicado en la tabla siguiente:
            </AlertDescription>
          </Alert>

          {/* Tabla de broncodilatadores */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="text-white" style={{ backgroundColor: "#0797b3" }}>
                  <th className="p-4 text-left">Principio activo</th>
                  <th className="p-4 text-left">Ejemplo</th>
                  <th className="p-4 text-left">Horas de espera</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b border-gray-200">
                  <td className="p-4">β-2 adrenérgicos por vía inhalatoria de acción corta</td>
                  <td className="p-4 font-medium">Salbutamol</td>
                  <td className="p-4 text-cyan-700 font-semibold">4 a 6 horas</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4">Anticolinérgicos por vía inhalatoria de acción corta</td>
                  <td className="p-4 font-medium">Ipratropio</td>
                  <td className="p-4 text-cyan-700 font-semibold">12 horas</td>
                </tr>
                <tr className="bg-white border-b border-gray-200">
                  <td className="p-4">β-2 Adrenérgicos por vía inhalatoria de acción prolongada</td>
                  <td className="p-4 font-medium">Salmeterol, Formoterol</td>
                  <td className="p-4 text-cyan-700 font-semibold">24 horas</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4">β-2 Adrenérgicos por vía inhalatoria de acción ultralarga</td>
                  <td className="p-4 font-medium">Indacaterol, Vilanterol, Olodaterol</td>
                  <td className="p-4 text-cyan-700 font-semibold">36 horas</td>
                </tr>
                <tr className="bg-white border-b border-gray-200">
                  <td className="p-4">Anticolinérgicos de acción larga</td>
                  <td className="p-4 font-medium">Triotropio, Umeclidinium, Glicopirronium</td>
                  <td className="p-4 text-cyan-700 font-semibold">48 horas</td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-4">Teofilinas de acción prolongada</td>
                  <td className="p-4 font-medium">Elexina Letocaps</td>
                  <td className="p-4 text-green-600 font-semibold">No es necesario esperar</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-4">Corticoides</td>
                  <td className="p-4 font-medium">Budesónida</td>
                  <td className="p-4 text-green-600 font-semibold">No es necesario esperar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Examen Exposición a Ruidos */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <Volume2 className="h-7 w-7 text-cyan-600 mr-3" />
            Examen Exposición a Ruidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RequisitoCard
              title="Cédula de identidad"
              description="Cédula de identidad vigente."
              icon={FileText}
            />
            <RequisitoCard
              title="Medicamentos"
              description="Si toma medicamentos, tómelos normalmente con agua."
              icon={Pill}
            />
            <RequisitoCard
              title="Salud del oído"
              description="No tener alteraciones en la salud del oído como otitis, inflamaciones o supuraciones."
              icon={AlertTriangle}
            />
            <RequisitoCard
              title="Reposo auditivo"
              description="Reposo auditivo de al menos 12 horas antes del examen (evitar discotecas, conciertos o ruido laboral de maquinarias)."
              icon={Clock}
            />
            <RequisitoCard
              title="En sala de espera"
              description="Evite usar el celular o auriculares para conservar el reposo auditivo."
              icon={Smartphone}
            />
          </div>
        </div>

        {/* Examen VIII Par */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <Ear className="h-7 w-7 text-cyan-600 mr-3" />
            Examen VIII Par
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RequisitoCard
              title="Ayuno"
              description="Ayuno mínimo de 4 horas y máximo de 12 horas."
              icon={Clock}
            />
            <RequisitoCard
              title="Medicamentos restringidos"
              description="No ingerir pastillas para dormir o relajantes musculares en 24 horas previas al examen."
              icon={Pill}
            />
          </div>
        </div>

        {/* Sección de contacto - Diseño normalizado */}
        <div className="relative mb-12">
          {/* Efectos de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/5 to-[#479cd0]/5 rounded-3xl blur-xl"></div>
          
          {/* Contenedor principal */}
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 overflow-hidden shadow-xl">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] px-8 py-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    ¿Tienes <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">dudas adicionales</span>?
                  </h3>
                  <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl">
                    Nuestro equipo médico está disponible para resolver cualquier consulta sobre la preparación de tus
                    exámenes con atención personalizada y profesional.
                  </p>
                </div>
                <div className="hidden md:block ml-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <Phone className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información de contacto */}
                <div className="space-y-6">
                  {/* Teléfono */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg">
                          <Phone className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#59c3ed] transition-colors duration-300">
                            Teléfono de contacto
                          </h4>
                          <p className="text-3xl font-bold text-[#59c3ed] mb-2">+56 9 8828 9770</p>
                          <p className="text-gray-600 font-medium">Respuesta inmediata por WhatsApp</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-xl flex items-center justify-center shadow-lg">
                          <Calendar className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#59c3ed] transition-colors duration-300">
                            Horarios de atención
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 font-semibold">Lunes a jueves:</span>
                              <span className="text-[#59c3ed] font-bold">8:00 - 18:00 hrs</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 font-semibold">Viernes:</span>
                              <span className="text-[#59c3ed] font-bold">8:00 - 17:00 hrs</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-6">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#59c3ed]/10 to-[#479cd0]/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#59c3ed]/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg group-hover:shadow-xl">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#59c3ed] transition-colors duration-300">
                        Contacto directo
                      </h4>
                      <div className="space-y-4">
                        <a
                          href="https://wa.me/56988289770"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn relative flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <svg className="w-6 h-6 mr-3 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109" />
                          </svg>
                          <span className="relative z-10 text-lg">Consultar por WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  )
}
