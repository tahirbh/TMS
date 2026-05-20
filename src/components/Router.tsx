import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

interface RouterContextType {
  pathname: string;
  navigate: (to: string) => void;
}

/* ------------------------------------------------------------------ */
/* Context                                                               */
/* ------------------------------------------------------------------ */

const RouterContext = createContext<RouterContextType>({
  pathname: '/',
  navigate: () => {},
});

/* ------------------------------------------------------------------ */
/* RouterProvider                                                        */
/* ------------------------------------------------------------------ */

export function RouterProvider({ children }: { children: ReactNode }) {
  const getPathname = () =>
    window.location.pathname || '/';

  const [pathname, setPathname] = useState<string>(getPathname);

  const navigate = useCallback((to: string) => {
    window.history.pushState(null, '', to);
    setPathname(to);
  }, []);

  useEffect(() => {
    const onPop = () => setPathname(getPathname());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Hooks                                                                 */
/* ------------------------------------------------------------------ */

export function useRouter() {
  return useContext(RouterContext);
}

export function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}

/* ------------------------------------------------------------------ */
/* Route + Switch                                                        */
/* ------------------------------------------------------------------ */

interface RouteProps {
  path: string;
  element: ReactNode;
  exact?: boolean;
  default?: boolean;
}

export function Route(_props: RouteProps): null {
  return null;
}

interface SwitchProps {
  children: ReactNode;
}

export function Switch({ children }: SwitchProps) {
  const { pathname } = useContext(RouterContext);

  // Collect Route children
  const routes: RouteProps[] = [];
  collectRoutes(children, routes);

  let matched: RouteProps | null = null;
  let defaultRoute: RouteProps | null = null;

  for (const route of routes) {
    if (route.default) {
      defaultRoute = route;
      continue;
    }
    if (route.exact) {
      if (pathname === route.path) {
        matched = route;
        break;
      }
    } else {
      if (pathname === route.path || pathname.startsWith(route.path + '/')) {
        matched = route;
        break;
      }
    }
  }

  return <>{(matched ?? defaultRoute)?.element ?? null}</>;
}

function collectRoutes(children: ReactNode, acc: RouteProps[]) {
  // We use React's Children-like iteration manually
  if (!children) return;
  if (Array.isArray(children)) {
    children.forEach(c => collectRoutes(c, acc));
    return;
  }
  const child = children as any;
  if (child?.props && 'path' in child.props) {
    acc.push(child.props as RouteProps);
  }
}

/* ------------------------------------------------------------------ */
/* Link                                                                  */
/* ------------------------------------------------------------------ */

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, className, ...rest }: LinkProps) {
  const { navigate } = useContext(RouterContext);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}
