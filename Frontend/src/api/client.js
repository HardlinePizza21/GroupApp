import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({ baseURL: BASE_URL });

/* ── Attach access token to every request ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── On 401: try refresh, retry once ── */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(err);
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

/* ── Auth ── */
export const authAPI = {
  register: (body) => api.post("/auth/register", body),
  login:    (body) => api.post("/auth/login", body),
  refresh:  (refreshToken) => api.post("/auth/refresh", { refreshToken }),
};

/* ── Groups ── */
export const groupsAPI = {
  list:   ()         => api.get("/groups/my"),
  create: (body)     => api.post("/groups", body),
  update: (id, body) => api.put(`/groups/${id}`, body),
  invite: (id, body) => api.post(`/groups/${id}/invite`, body),
};

/* ── Channels ── */
export const channelsAPI = {
  list:   (groupId)        => api.get(`/groups/${groupId}/channels`),
  create: (groupId, body)  => api.post(`/groups/${groupId}/channels`, body),
};

/* ── Messages ── */
export const messagesAPI = {
  list: (channelId, page = 1) =>
    api.get(`/channels/${channelId}/messages`, { params: { page, limit: 50 } }),
  send: (channelId, formData) =>
    api.post(`/channels/${channelId}/messages`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
