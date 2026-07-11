export interface Company {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CompanyAccessEntry {
  userId: string;
  canView: boolean;
  canEdit: boolean;
}
