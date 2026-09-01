import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds to accommodate Render free-tier cold starts
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const errorList = error.response?.data?.errors;
    let errorMsg = isTimeout
      ? 'Server is waking up (Render free tier). Please wait a few seconds and try again.'
      : 'Something went wrong. Please try again.';
      
    if (Array.isArray(errorList) && errorList.length > 0) {
      errorMsg = errorList.join(', ');
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message && !isTimeout) {
      errorMsg = error.message;
    }

    const customError = {
      message: errorMsg,
      errors: errorList || [],
      status: error.response?.status || (isTimeout ? 408 : 500),
      isTimeout,
    };
    return Promise.reject(customError);
  }
);

export default api;
