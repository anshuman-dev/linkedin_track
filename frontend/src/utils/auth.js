const TOKEN_KEY = 'linkedin_tracker_token';
const ADMIN_KEY = 'linkedin_tracker_admin';

export const auth = {
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAdmin(admin) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },

  getAdmin() {
    const admin = localStorage.getItem(ADMIN_KEY);
    return admin ? JSON.parse(admin) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};