"use client";

import { toast } from "sonner";
import { getUiLang } from "@/lib/i18n/lang";
import { messagesByLang } from "@/lib/i18n/messages";

function msg() {
  return messagesByLang[getUiLang()];
}

export const Toast = {
  success: (message: string) =>
    toast.success(message),

  error: (message: string) =>
    toast.error(message),

  info: (message: string) =>
    toast(message),

  loading: (message: string) =>
    toast.loading(message),

  dismiss: () =>
    toast.dismiss(),

  addToCart: () =>
    toast.success(msg().toast.addedToCart),

  removeFromCart: () =>
    toast.success(msg().toast.removedFromCart),

  cartCleared: () =>
    toast.success(msg().toast.cartCleared),

  accountCreated: () =>
    toast.success(msg().toast.accountCreated),

  loggedIn: () =>
    toast.success(msg().toast.loggedIn),

  loggedOut: () =>
    toast.success(msg().toast.loggedOut),

  resetCodeSent: () =>
    toast.success(msg().toast.resetCodeSent),

  passwordUpdated: () =>
    toast.success(msg().toast.passwordUpdated),

  addToFavorites: () =>
    toast.success("Added to favorites"),

  removeFromFavorites: () =>
    toast.success("Removed from favorites"),

  productAdded: () =>
    toast.success("Product added successfully"),

  productUpdated: () =>
    toast.success("Product updated"),

  productDeleted: () =>
    toast.success("Product removed"),

  saved: () =>
    toast.success("Saved successfully"),
};
