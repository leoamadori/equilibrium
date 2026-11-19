import { useEffect, useState } from 'react';

export type RouteName = 'home' | 'guida' | 'sessione' | 'statistiche' | 'impostazioni';

const HASH_TO_ROUTE: Record<string, RouteName> = {
  '': 'home',
  '#/': 'home',
  '#/guida': 'guida',
  '#/sessione': 'sessione',
  '#/statistiche': 'statistiche',
  '#/impostazioni': 'impostazioni',
};

export function parseHashRoute(hash: string): RouteName {
  const clean = hash.split('?')[0];
  return HASH_TO_ROUTE[clean] ?? 'home';
}

export function navigateTo(route: RouteName): void {
  const target = route === 'home' ? '#/' : `#/${route}`;
  if (window.location.hash !== target) {
    window.location.hash = target;
  }
}

export function useHashRoute(): [RouteName, (route: RouteName) => void] {
  const [route, setRoute] = useState<RouteName>(() => parseHashRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashRoute(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return [route, navigateTo];
}
