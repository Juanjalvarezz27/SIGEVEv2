export interface UserSession {
  nombre?: string | null;
  email?: string | null;
  rol?: string; 
  comercioId?: string | null;
}

export interface NavbarProps {
  user?: UserSession;
}