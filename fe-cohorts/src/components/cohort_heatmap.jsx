import React, { useEffect, useState } from "react";
import * as echarts from "echarts";
import { getBalanceData } from "../services/cohort_services";
import { Box, Button, Grid, TextField, Typography} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const CohortHeatmap = () => {
    const [chartData, setChartData] = useState([]);
    const [cohortNames, setCohortNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        start_date: null,
        end_date: null,
        quincena: ''
    });

    const fetchData = async (appliedFilters = {}) => {
        setLoading(true);
        try {
            const queryFilters = {
                ...appliedFilters,
                start_date: appliedFilters.start_date ? appliedFilters.start_date.format("YYYY-MM-DD") : null,
                end_date: appliedFilters.end_date ? appliedFilters.end_date.format("YYYY-MM-DD") : null,
            };

            const data = await getBalanceData(queryFilters);
            const uniqueCohortNames = [...new Set(data.map(item => item.nombre_cohorte))];

            const transformedData = data.map(item => ({
                x: item.quincena - 1,
                y: uniqueCohortNames.indexOf(item.nombre_cohorte),
                porcentaje: item.porcentaje_activas,
                cantidad: item.cantidad_activas,
                fecha: item.fecha,
                tipo_linea: item.tipo_linea, // nuevo campo
                total_vendido: item.total_vendido // nuevo campo
            }));

            setCohortNames(uniqueCohortNames);
            setChartData(transformedData);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) {
            const chartDom = document.getElementById("main");
            const myChart = echarts.init(chartDom);

            const option = {
                tooltip: {
                    position: "top",
                    formatter: (params) => {
                        const dataItem = chartData[params.dataIndex];
                        return `
                            <b>Cohorte:</b> ${cohortNames[dataItem.y]}<br/>
                            <b>Quincena:</b> ${dataItem.x + 1}<br/>
                            <b>Fecha quincena:</b> ${dataItem.fecha}<br/>
                            <b>Tipo contrato:</b> ${dataItem.tipo_linea}<br/>
                            <b>Total vendido:</b> ${dataItem.total_vendido}<br/> 
                            <b>Porcentaje Activas:</b> ${dataItem.porcentaje}%<br/>
                            <b>Cantidad Activas:</b> ${dataItem.cantidad}<br/>
                        `;
                    },
                },
                grid: {
                    height: "100%",
                    width: "85%",
                    left: 120, // más espacio para el eje Y
                    top: 60,
                    
                },
                xAxis: {
                    type: "category",
                    data: Array.from({ length: 36 }, (_, i) => `Q${i + 1}`),
                    splitArea: { show: true },
                    axisLabel: {
                        fontSize: 10,
                    }
                },
                yAxis: {
                    type: "category",
                    data: cohortNames,
                    splitArea: { show: true },
                    axisLabel: {
                        fontSize: 9,
                        overflow: "break",
                        width: 95,
                        lineHeight: 9,
                    }
                },
                visualMap: {
                    min: 0,
                    max: 100,
                    calculable: true,
                    orient: "vertical",
                    right: "right",
                    top: "middle",
                    text: ["Porcentaje Activas"],
                    inRange: {
                        color: ["#fd2e1a", "#cccf0a", "#54c60a", "#24bd09"]


                    },
                },
                series: [
                    {
                        name: "Cohortes",
                        type: "heatmap",
                        data: chartData.map(({ x, y, porcentaje }) => [x, y, porcentaje]),
                        label: {
                            show: true,
                            formatter: (params) => {
                                const dataItem = chartData[params.dataIndex];
                                return `${dataItem.porcentaje}%\n(${dataItem.cantidad})`;
                            },
                            fontSize: 9,
                            color: "#000",
                            padding: [2, 2, 2, 2]
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowColor: "rgba(0, 0, 0, 0.5)",
                            },
                        },
                    },
                ],
            };

            myChart.setOption(option);
        }
    }, [chartData, cohortNames, loading]);

    const applyFilters = () => {
        fetchData(filters);
    };

    return (
        <Box sx={{ width: "100%", height: "100vh" }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Filtros
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <DatePicker
                                label="Fecha Inicio"
                                value={filters.start_date}
                                onChange={(value) => setFilters({ ...filters, start_date: value })}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <DatePicker
                                label="Fecha Fin"
                                value={filters.end_date}
                                onChange={(value) => setFilters({ ...filters, end_date: value })}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Quincena"
                                type="number"
                                inputProps={{ min: 1, max: 36 }}
                                value={filters.quincena}
                                onChange={(e) => setFilters({ ...filters, quincena: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={applyFilters}
                            >
                                Aplicar Filtros
                            </Button>
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </Box>

            {loading ? (
                <Typography variant="body1" sx={{ p: 3 }}>Cargando datos...</Typography>
            ) : (
                <Box id="main" sx={{ width: "100%", height: "100vh" }}></Box>
            )}
        </Box>
    );
};

export default CohortHeatmap;
