import api from './api';

export const chatService = {
  sendMessage: async (message) => {
    const data = await api.post('/chat', { message });
    return data;
  },
};

export default chatService;
