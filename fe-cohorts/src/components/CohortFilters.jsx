import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CohortFilters = ({ onFilterChange }) => {
  const [fechas, setFechas] = useState({ min_fecha: '', max_fecha: '' });
  const [selectedFecha, setSelectedFecha] = useState('');

  useEffect(() => {
    const loadDates = async () => {
      try {
        const response = await axios.get("http://localhost:8000/cohorts_date_range/");
        const range = response.data;
        if (range.min_fecha) {
          setFechas(range);
          setSelectedFecha(range.min_fecha);
          if (typeof onFilterChange === 'function') {
            onFilterChange(range.min_fecha);
          }
        }
      } catch (error) {
        console.error('Error al obtener el rango de fechas:', error);
      }
    };

    loadDates();
  }, [onFilterChange]);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedFecha(value);
    if (typeof onFilterChange === 'function') {
      onFilterChange(value);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ marginRight: '0.5rem' }}>Selecciona una fecha de inicio:</label>
      <input
        type="date"
        value={selectedFecha}
        min={fechas.min_fecha}
        max={fechas.max_fecha}
        onChange={handleChange}
      />
    </div>
  );
};

export default CohortFilters;
