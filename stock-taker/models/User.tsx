export interface SupabaseUser {
  id: string;
  name: string;
  department: number;
  email: string;
  approved: boolean;
  admin: boolean;
}
