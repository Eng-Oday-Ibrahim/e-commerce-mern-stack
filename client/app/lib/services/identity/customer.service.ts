import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { CustomerApi } from "@/api/identity/customer";

export const CustomerService = {
  // Customers
  register: async (input: { name: string; email: string; password: string }) => {
    try {
      const res = await CustomerApi.register(input);
      Toast.accountCreated();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  login: async (input: { email: string; password: string }) => {
    try {
      const res = await CustomerApi.login(input);
      Toast.loggedIn();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  logout: async () => {
    try {
      const res = await CustomerApi.logout();
      Toast.loggedOut();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  ForgotPassword: async (input: { email: string }) => {
    try {
      const res = await CustomerApi.forgotPassword(input);
      Toast.resetCodeSent();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  ResetPassword: async (input: { token: string; newPassword: string }) => {
    try {
      const res = await CustomerApi.resetPassword(input);
      Toast.passwordUpdated();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
  wishlistList: async () => CustomerApi.wishlistList(),
  wishlistAdd: async (productId: string) => {
    try {
      return await CustomerApi.wishlistAdd(productId);
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
  wishlistRemove: async (productId: string) => {
    try {
      return await CustomerApi.wishlistRemove(productId);
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
