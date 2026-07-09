export type UserRole = "admin" | "logistics" | "sales";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    name: "Cristian Zaballa",
    email: "cristian@sigas.bo",
    password: "admin123",
    role: "admin",
  },
  {
    id: "2",
    name: "Harold",
    email: "harold@sigas.bo",
    password: "harold123",
    role: "logistics",
  },
  {
    id: "3",
    name: "Mirael",
    email: "mirael@sigas.bo",
    password: "mirael123",
    role: "sales",
  },
];
