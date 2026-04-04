export const API_BASE_URL = 'http://10.208.138.106:8000'; // Updated to FastAPI port

export const ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/register`,
  LOGIN: `${API_BASE_URL}/login`,
  ADMIN_LOGIN: `${API_BASE_URL}/admin_login`,
  LIST_USERS: `${API_BASE_URL}/list_users`,
  ACTIVATE_USER: `${API_BASE_URL}/activate_user`,
  PREDICT: `${API_BASE_URL}/predict`,
};
