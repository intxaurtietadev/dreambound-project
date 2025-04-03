  import axios from "axios";

  const api = axios.create({
    baseURL: "/api", // Ahora usamos "/api" en lugar de "http://localhost:3000"
    headers: {
      "Content-Type": "application/json",
    },
  });

  export default api;
