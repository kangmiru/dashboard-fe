import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: "guest",
    role: "guest",
    isAuthenticated: false,
  }),
  actions: {
    setUserRole(role: string) {
      this.role = role;
    },
    loginUser(name: string, role: string) {
      this.isAuthenticated = true;
      this.role = role;
      this.name = name;
    },
    logoutUser() {
      this.isAuthenticated = false;
    },
  },
  persist: true,
});
