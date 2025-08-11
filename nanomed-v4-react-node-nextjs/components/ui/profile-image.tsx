import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface ProfileImageProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt = 'Foto de perfil',
  fallback,
  size = 'md',
  className = ''
}) => {
  // Determinar el tamaño de la clase
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-32 w-32',
    xl: 'h-48 w-48'
  };

  // Función para verificar si la URL es válida
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Si es una URL de Azure Blob Storage, es válida
    if (url.includes('blob.core.windows.net')) {
      return true;
    }
    
    // Si es una URL local del servidor, no es válida para Azure
    if (url.startsWith('/') || url.includes('dev.nanomed.cl/dashboard/')) {
      return false;
    }
    
    // Para otros casos, verificar si es una URL válida
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Determinar la URL a mostrar
  const imageUrl = src && isValidUrl(src) ? src : undefined;

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage
        src={imageUrl}
        alt={alt}
        onError={(e) => {
          // Si la imagen falla al cargar, ocultarla
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      <AvatarFallback className="text-lg">
        {fallback || 'U'}
      </AvatarFallback>
    </Avatar>
  );
}; 