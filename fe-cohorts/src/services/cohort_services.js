import axios from 'axios';

export const getBalanceData = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/cohorts_data/');        
        if (response) {
            return response.data;
        }
    } catch (err) {
        console.error(err);
        throw new Error('Error al obtener el balance disponible');
    }
};