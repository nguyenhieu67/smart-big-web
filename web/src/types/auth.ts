export type FarmRole = "OWNER" | "MANAGER" | "STAFF";

export interface Farm {
  id: string;
  name: string;
  role: FarmRole;
}

export interface User {
  id: string;
  email: string;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface AuthResult {
  id: string;
  email: string;
  farms: Farm[];
}
