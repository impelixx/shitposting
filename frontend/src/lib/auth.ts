"use client";
import Cookies from "js-cookie";

const KEY = "blog_token";

export const auth = {
  getToken: () => Cookies.get(KEY) ?? null,
  setToken: (token: string) => Cookies.set(KEY, token, { expires: 30 }),
  removeToken: () => Cookies.remove(KEY),
  isLoggedIn: () => !!Cookies.get(KEY),
};
