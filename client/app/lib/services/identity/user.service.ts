import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { UserApi } from "@/api/identity/user";

export const UserService = {

  // Users
  login: async (input: { email: string; password: string }) => {
    try {
      const res = await UserApi.login(input);
      Toast.success("Welcome");
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  logout: async () => {
    try {
      const res = await UserApi.logout();
      Toast.success("Logged out");
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  ForgotPassword: async (input: { email: string }) => {
    try {
      const res = await UserApi.forgotPassword(input);
      Toast.success("If the email exists, we sent a reset link");
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  ResetPassword: async (input: { token: string; newPassword: string }) => {
    try {
      const res = await UserApi.resetPassword(input);
      Toast.success("Password updated");
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
