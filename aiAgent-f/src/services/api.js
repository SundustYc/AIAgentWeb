import axios from 'axios';

const API_URL = 'http://localhost:5000';

export async function apiSendMessage(message, prompt) {
    try {
        const response = await axios.post(`${API_URL}/chat`, { message, prompt });
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

export async function apiResetMemory() {
    try {
        const response = await axios.post(`${API_URL}/reset`);
        console.log('Memory reset response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Memory reset error:', error);
        throw error;
    }
}
