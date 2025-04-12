import React, { useEffect, useState } from "react";
import * as echarts from "echarts";
import { getBalanceData } from "../services/cohort_services";
import {
    Box,
    Button,
    Drawer,
    Grid,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const CohortHeatmap = () => {
    const [chartData, setChartData] = useState([]);
    const [cohortNames, setCohortNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
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
                tipo_linea: item.tipo_linea,
                total_vendido: item.total_vendido
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
                    width: "86%",
                    left: 120,
                    top: 60,
                    bottom: 30
                },
                xAxis: {
                    type: "category",
                    data: Array.from({ length: 36 }, (_, i) => `Q${i + 1}`),
                    splitArea: { show: true },
                    axisLabel: {
                        fontSize: 12,
                    }
                },
                yAxis: {
                    type: "category",
                    data: cohortNames,
                    splitArea: { show: true },
                    axisLabel: {
                        fontSize: 12,
                        overflow: "truncate",
                        width: 99,
                        lineHeight: 14,
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
                            fontSize: 10,
                            color: "#000",
                            padding: [3, 3, 3, 3]
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
            window.addEventListener("resize", myChart.resize);
            return () => window.removeEventListener("resize", myChart.resize);
        }
    }, [chartData, cohortNames, loading]);

    const applyFilters = () => {
        fetchData(filters);
        setDrawerOpen(false);
    };

    return (
        <Box sx={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
                <IconButton onClick={() => setDrawerOpen(true)} color="primary">
                    <FilterListIcon />
                </IconButton>
                <Typography variant="h6" ml={1}>
                    Filtro de Cohortes
                </Typography>
            </Box>

            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
    <Box
        sx={{
            width: 320,
            p: 3,
            height: "100%",
            backgroundColor: "#eae4ec", 
            fontFamily: "Roboto, sans-serif", 
        }}
    >
        <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600, color: "#A02383" }}
        >
            Filtros
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <DatePicker
                        label="Fecha Inicio"
                        value={filters.start_date}
                        onChange={(value) => setFilters({ ...filters, start_date: value })}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: "small",
                                variant: "outlined"
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <DatePicker
                        label="Fecha Fin"
                        value={filters.end_date}
                        onChange={(value) => setFilters({ ...filters, end_date: value })}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: "small",
                                variant: "outlined"
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Quincena"
                        type="number"
                        inputProps={{ min: 1, max: 36 }}
                        value={filters.quincena}
                        onChange={(e) => setFilters({ ...filters, quincena: e.target.value })}
                        size="small"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={applyFilters}
                        sx={{ mt: 1, fontWeight: 500 }}
                    >
                        Aplicar Filtros
                    </Button>
                </Grid>
            </Grid>
        </LocalizationProvider>
    </Box>
</Drawer>

            {loading ? (
                <Typography variant="body1" sx={{ p: 3 }}>Cargando datos...</Typography>
            ) : (
                <Box id="main" sx={{ flexGrow: 1, minHeight: 0, width: "100%" }}></Box>
            )}
        </Box>
    );
};

export default CohortHeatmap;
