import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "../types";

export type LocalizedString = { ar: string; en: string };

export type UserDto = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const UserApi = {
  
  //  Users
  login: async (input: { email: string; password: string }) => {
    const res = await api.post<ApiOkResponse<{ sessionId: string; user: UserDto }>>(
      "/api/identity/users/login",
      input
    );
    return res.data;
  },

  logout: async () => {
    const res = await api.post<ApiOkResponse>("/api/identity/users/logout");
    return res.data;
  },

  me: async () => {
    const res = await api.get<ApiOkResponse<{ userId: string; user: UserDto }>>("/api/identity/users/me");
    return res.data;
  },

  forgotPassword: async (input: { email: string }) => {
    const res = await api.post<ApiOkResponse & { dev?: any }>(
      "/api/identity/users/forgot-password",
      input
    );
    return res.data;
  },

  resetPassword: async (input: { token: string; newPassword: string }) => {
    const res = await api.post<ApiOkResponse<{ sessionId: string; user: UserDto }>>(
      "/api/identity/users/reset-password",
      input
    );
    return res.data;
  },

  createInvitation: async (input: { email: string; name: string }) => {
    const res = await api.post<ApiOkResponse & { user?: any; dev?: { password?: string } }>(
      "/api/identity/users/invitations",
      input
    );
    return res.data;
  },

  acceptInvitation: async (input: { token: string; password: string }) => {
    const res = await api.post<
      ApiOkResponse<{ sessionId: string; user: UserDto; invitation: any }>
    >("/api/identity/users/accept-invite", input);
    return res.data;
  },

  listTeam: async () => {
    const res = await api.get<ApiOkResponse<{ users: UserDto[] }>>("/api/identity/users/admin/list");
    return res.data;
  },

  patchTeamMember: async (id: string, patch: Partial<Pick<UserDto, "isActive">>) => {
    const res = await api.patch<ApiOkResponse<{ user: UserDto }>>(`/api/identity/users/admin/${id}`, patch);
    return res.data;
  },

  bootstrapFirst: async (
    input: { email: string; name: string; password: string },
    bootstrapToken: string
  ) => {
    const res = await api.post<ApiOkResponse<{ sessionId: string; user: UserDto }>>(
      "/api/identity/users/bootstrap",
      input,
      { headers: { "x-bootstrap-token": bootstrapToken } }
    );
    return res.data;
  },
};
