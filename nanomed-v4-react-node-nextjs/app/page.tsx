"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CloudinaryVideoBackground } from "@/components/cloudinary-video-background"
import { SimpleCarousel } from "@/components/simple-carousel"
import { CliengoChat } from "@/components/cliengo-chat"
import { Scan, TestTube, Video, Shield, Syringe, Truck, Phone, Mail, User, Building, MessageCircle, Send } from "lucide-react"
import { useAuth } from "@/lib/api/hooks/use-auth"
import { useState } from "react"
import { contactService, type ContactFormData } from "@/lib/api/services/contact.service"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  // Estado del formulario de contacto
  const [formData, setFormData] = useState<ContactFormData>({
    nombreApellido: '',
    empresa: '',
    servicio: '',
    telefono: '',
    email: '',
    mensaje: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Validar que los campos requeridos estén completos
      if (!formData.nombreApellido || !formData.telefono || !formData.email || !formData.servicio || !formData.mensaje) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive",
        })
        return
      }

      // Enviar el formulario usando el servicio de contacto
      const response = await contactService.sendContactMessage(formData)
      
      if (response.error) {
        toast({
          title: "Error al enviar mensaje",
          description: response.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "¡Mensaje enviado exitosamente!",
          description: "Nos pondremos en contacto contigo pronto.",
          variant: "default",
        })
        
        // Limpiar el formulario
        setFormData({
          nombreApellido: '',
          empresa: '',
          servicio: '',
          telefono: '',
          email: '',
          mensaje: ''
        })
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al enviar tu mensaje. Por favor intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen flex flex-col">
      <CliengoChat />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <CloudinaryVideoBackground
          cloudName="diuym5ii0"
          publicId="video01-transcode_t1z328"
          fallbackImageSrc="/images/medical-tech.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Salud de Vanguardia con Tecnología Médica Avanzada
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-3xl mx-auto">
            Somos pioneros en acercar salud de calidad donde más se necesita. Llevamos atención médica moderna a zonas
            rurales y mineras, combinando IA, telemedicina y diagnóstico de última generación.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" className="bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black bg-transparent font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

            {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-stretch gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Tecnología al servicio de la salud</h2>
              <p className="text-lg text-gray-700 mb-6 text-justify">
                En nanoMED, somos expertos en medicina preventiva laboral, ofreciendo soluciones vanguardistas
                potenciadas por inteligencia artificial. Implementamos atención en terreno y tecnología avanzada para
                garantizar el bienestar de los trabajadores y mejorar el acceso a la salud en comunidades rurales
                desatendidas. Contamos con infraestructura completa para exámenes de laboratorio, diagnóstico por
                imágenes y procedimientos clínicos, asegurando una atención integral y de alta calidad. Además,
                disponemos de una red de especialistas médicos que nos permite ofrecer consultas especializadas y un
                enfoque multidisciplinario en el cuidado de la salud.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="bg-cyan-100 rounded-full p-2">
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
                      className="text-cyan-600"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Atención personalizada</h3>
                    <p className="text-sm text-gray-600">Centrada en el paciente</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="bg-cyan-100 rounded-full p-2">
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
                      className="text-cyan-600"
                    >
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Diagnósticos precisos</h3>
                    <p className="text-sm text-gray-600">Asistidos por IA</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="bg-cyan-100 rounded-full p-2">
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
                      className="text-cyan-600"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h.01" />
                      <path d="M17 7h.01" />
                      <path d="M7 17h.01" />
                      <path d="M17 17h.01" />
                      <path d="M12 12h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Tecnología avanzada</h3>
                    <p className="text-sm text-gray-600">Equipos de última generación</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="bg-cyan-100 rounded-full p-2">
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
                      className="text-cyan-600"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Seguridad y privacidad</h3>
                    <p className="text-sm text-gray-600">Datos protegidos</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 flex flex-col">
              <div className="relative rounded-lg overflow-hidden shadow-xl h-[300px] md:h-[400px] lg:h-[500px]">
                <Image
                  src="/images/medical-tech.webp"
                  alt="Tecnología médica"
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'center center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                  <div className="p-4 md:p-6 w-full">
                    <h3 className="text-white text-lg md:text-xl font-bold mb-2">Innovación constante</h3>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed">
                      Nuestro compromiso es mantenernos a la vanguardia de la tecnología médica para ofrecerte el mejor
                      servicio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título de sección */}
            <div className="text-center mb-12">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#59c3ed' }}>Servicios</h2>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Servicios médicos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">especializados</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Soluciones integrales de salud con tecnología de vanguardia para empresas y comunidades
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ServiceCard
                title="Imagenología"
                description="Ofrecemos un servicio integral de imagenología con equipamiento de última generación para radiografías y ecografías digitales, asegurando una evaluación detallada y confiable para cada paciente."
                image="/images/imagenologia.webp"
                icon={Scan}
              />
              <ServiceCard
                title="Laboratorio"
                description="Realizamos pruebas y exámenes de laboratorio con tecnología de vanguardia para detectar enfermedades de forma rápida y precisa. Estudios de química sanguínea, orina, drogas y más."
                image="/images/laboratorio.webp"
                icon={TestTube}
              />
              <ServiceCard
                title="Telemedicina"
                description="Consultas médicas virtuales integrales desarrolladas en nuestras instalaciones mediante modalidad híbrida con soporte de personal sanitario especializado, o implementadas remotamente según las necesidades clínicas específicas del paciente."
                image="/images/Telemedicina-800.png"
                icon={Video}
              />
              <ServiceCard
                title="Salud Ocupacional"
                description="Ofrecemos soluciones vanguardistas adaptadas a las exigencias del entorno laboral minero y con atención en terreno. Desde exámenes de A&D (alcohol y drogas), polisomnografías, baterías de exámenes y salud mental laboral, garantizando el bienestar y seguridad de los trabajadores."
                image="/images/BateriasPreocupacionales.webp"
                icon={Shield}
              />
              <ServiceCard
                title="Vacunatorio"
                description="Brindamos inmunización integral con esquemas de vacunación para empresas, trabajadores y comunidades. Vacunas contra influenza, hepatitis, fiebre amarilla y más."
                image="/images/vacunatorio.webp"
                icon={Syringe}
              />
              <ServiceCard
                title="Servicio de ambulancia 4x4"
                description="Nuestros servicios de ambulancias 4x4 cuentan con paramédicos y choferes para turnos 7x7 equipados con tecnología avanzada para el monitoreo en ruta, asegurando un traslado rápido y seguro de pacientes en zonas de difícil acceso."
                image="/images/ambulancia-4x4.webp"
                icon={Truck}
              />
            </div>
          </div>
        </div>
      </section>



      {/* Clients Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título de sección */}
            <div className="text-center mb-12">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#59c3ed' }}>Confían en nosotros</h2>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Innovación Médica de Alto Nivel para <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">Empresas Líderes</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Trabajamos con compañías mineras y corporaciones que buscan soluciones avanzadas en salud ocupacional y
                tecnología médica de precisión. Nuestra red de clientes confía en nanoMED para cuidar a sus equipos.
              </p>
            </div>
            
            <SimpleCarousel />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título de sección */}
            <div className="text-center mb-12">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#59c3ed' }}>¿Necesitas más información?</h2>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tu salud, es nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#59c3ed] to-[#479cd0]">prioridad</span>, déjanos tu mensaje
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Nuestro equipo médico está listo para atender tus consultas y brindarte la mejor atención personalizada
              </p>
            </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Imagen */}
            <div className="lg:order-1">
              <div className="relative rounded-lg overflow-hidden shadow-xl h-full min-h-[600px]">
                <Image
                  src="/images/doctor-contact.webp"
                  alt="Contacto médico profesional"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover object-center"
                  style={{ objectPosition: 'center center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-white text-xl font-bold mb-2">Atención personalizada</h3>
                    <p className="text-white/90">
                      Nuestro equipo médico está listo para atender tus consultas y brindarte la mejor atención.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Formulario */}
            <div className="lg:order-2 flex flex-col justify-center">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre y Apellido */}
                <div>
                  <Label htmlFor="nombreApellido" className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre y Apellido *
                  </Label>
                  <Input
                    id="nombreApellido"
                    type="text"
                    value={formData.nombreApellido}
                    onChange={(e) => handleInputChange('nombreApellido', e.target.value)}
                    required
                    className="mt-2"
                    style={{ backgroundColor: '#f0f6f7' }}
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                {/* Empresa */}
                <div>
                  <Label htmlFor="empresa" className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Empresa
                  </Label>
                  <Input
                    id="empresa"
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => handleInputChange('empresa', e.target.value)}
                    className="mt-2"
                    style={{ backgroundColor: '#f0f6f7' }}
                    placeholder="Nombre de tu empresa (opcional)"
                  />
                </div>

                {/* Servicios */}
                <div>
                  <Label htmlFor="servicio" className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Servicio de interés *
                  </Label>
                  <Select value={formData.servicio} onValueChange={(value) => handleInputChange('servicio', value)}>
                    <SelectTrigger className="mt-2" style={{ backgroundColor: '#f0f6f7' }}>
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Imagenología">Imagenología</SelectItem>
                      <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                      <SelectItem value="Telemedicina">Telemedicina</SelectItem>
                      <SelectItem value="Salud Ocupacional">Salud Ocupacional</SelectItem>
                      <SelectItem value="Vacunatorio">Vacunatorio</SelectItem>
                      <SelectItem value="Servicio de ambulancia 4x4">Servicio de ambulancia 4x4</SelectItem>
                      <SelectItem value="Consulta General">Consulta General</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Teléfono */}
                <div>
                  <Label htmlFor="telefono" className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono *
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    required
                    className="mt-2"
                    style={{ backgroundColor: '#f0f6f7' }}
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Correo electrónico *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="mt-2"
                    style={{ backgroundColor: '#f0f6f7' }}
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <Label htmlFor="mensaje" className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Mensaje *
                  </Label>
                  <Textarea
                    id="mensaje"
                    value={formData.mensaje}
                    onChange={(e) => handleInputChange('mensaje', e.target.value)}
                    required
                    className="mt-2"
                    style={{ backgroundColor: '#f0f6f7' }}
                    placeholder="Cuéntanos sobre tu consulta o necesidad médica..."
                    rows={4}
                  />
                </div>

                {/* Botón de envío */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#59c3ed] to-[#479cd0] hover:from-[#479cd0] hover:to-[#59c3ed] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
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
    </div>
  )
}

// Componente ServiceCard moderno
function ServiceCard({ title, description, image, icon: Icon }) {
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
            {/* Icono */}
            {Icon && (
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-[#59c3ed] to-[#479cd0] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
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
