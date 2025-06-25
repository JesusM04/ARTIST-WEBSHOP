/**
 * Utilidades para optimizar el rendimiento de la aplicación
 */

// Debounce: Evita ejecutar una función varias veces seguidas
export const debounce = <T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};

// Throttle: Limita la frecuencia de ejecución de una función
export const throttle = <T extends (...args: any[]) => any>(
  fn: T, 
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Memoize: Memoriza el resultado de una función para evitar cálculos repetidos
export const memoize = <T extends (...args: any[]) => any>(
  fn: T
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(...args: Parameters<T>) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Función para cargar recursos de manera diferida
export const loadResourceWhenIdle = (
  src: string,
  resourceType: 'script' | 'style' = 'script',
  callback?: () => void
): void => {
  if (typeof window === 'undefined' || typeof requestIdleCallback === 'undefined') {
    return;
  }
  
  requestIdleCallback(() => {
    let element: HTMLScriptElement | HTMLLinkElement;
    
    if (resourceType === 'script') {
      element = document.createElement('script');
      element.src = src;
      element.async = true;
    } else {
      element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = src;
    }
    
    if (callback) {
      element.onload = callback;
    }
    
    document.head.appendChild(element);
  });
};

// Función para optimizar las animaciones en componentes React
export const optimizeAnimations = (callback: () => void): void => {
  if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
    callback();
    return;
  }
  
  requestAnimationFrame(() => {
    callback();
  });
};

// Detección de soporte para características del navegador
export const browserSupports = {
  intersection: typeof IntersectionObserver !== 'undefined',
  requestIdleCallback: typeof requestIdleCallback !== 'undefined',
  lazyLoading: 'loading' in HTMLImageElement.prototype,
  webp: false, // Se inicializa en false y se comprueba a continuación
};

// Verificar soporte para WebP
if (typeof window !== 'undefined') {
  const webpTest = new Image();
  webpTest.onload = function() {
    browserSupports.webp = webpTest.width > 0 && webpTest.height > 0;
  };
  webpTest.onerror = function() {
    browserSupports.webp = false;
  };
  webpTest.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
}

// Función para descomponer tareas largas en pequeñas tareas programadas
export const chunkProcessing = <T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize = 5,
  delay = 0
): Promise<R[]> => {
  return new Promise((resolve) => {
    const results: R[] = [];
    let index = 0;
    
    function processNextChunk() {
      const chunk = items.slice(index, index + chunkSize);
      index += chunkSize;
      
      chunk.forEach((item) => {
        results.push(processor(item));
      });
      
      if (index < items.length) {
        setTimeout(processNextChunk, delay);
      } else {
        resolve(results);
      }
    }
    
    processNextChunk();
  });
};

// Definir un tipo para la propiedad NetworkInformation
interface NetworkInformation {
  effectiveType?: string;
  type?: string;
}

// Función para detectar si estamos en un entorno con conexión lenta
export const isLowBandwidth = (): boolean => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }
  
  // Usar una interfaz tipada para la propiedad connection
  const connection = (navigator as any).connection as NetworkInformation;
  
  if (!connection) return false;
  
  // Detectar conexiones lentas
  if (connection.effectiveType && typeof connection.effectiveType === 'string') {
    return ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
  }
  
  if (connection.type && typeof connection.type === 'string') {
    return ['cellular', '2g', '3g'].includes(connection.type);
  }
  
  return false;
};

// Función para optimizar el payload JSON
export const optimizeJsonPayload = <T extends Record<string, any>>(
  data: T,
  fieldsToInclude?: (keyof T)[]
): Partial<T> => {
  if (!fieldsToInclude) return data;
  
  return fieldsToInclude.reduce((acc, field) => {
    if (field in data) {
      acc[field] = data[field];
    }
    return acc;
  }, {} as Partial<T>);
};

// Exportar todas las utilidades
export default {
  debounce,
  throttle,
  memoize,
  loadResourceWhenIdle,
  optimizeAnimations,
  browserSupports,
  chunkProcessing,
  isLowBandwidth,
  optimizeJsonPayload,
}; 