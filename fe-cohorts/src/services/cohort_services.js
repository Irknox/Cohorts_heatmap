import axios from "axios";

export const getBalanceData = async (filters) => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/cohorts_data/", {
            params: filters
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener el balance:", error);
        throw new Error("Error al obtener los datos del balance");
    }
};

  
