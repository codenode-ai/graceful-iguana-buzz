import * as React from 'react';

// Define o ponto de interrupção para considerar o layout como "mobile".
const MOBILE_BREAKPOINT = 768;

/**
 * Hook para detectar se a largura da viewport é considerada mobile.
 *
 * Retorna um booleano indicando se o tamanho da tela é menor que o
 * `MOBILE_BREAKPOINT`. Este hook adiciona um listener ao evento
 * `matchMedia` e atualiza o estado sempre que a largura da viewport muda.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}