import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorList = error.response?.data?.errors;
    let errorMsg = 'Something went wrong. Please try again.';
    if (Array.isArray(errorList) && errorList.length > 0) {
      errorMsg = errorList.join(', ');
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message) {
      errorMsg = error.message;
    }

    const customError = {
      message: errorMsg,
      errors: errorList || [],
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default api;
