from django.http import JsonResponse
from .services.cohort_heatmap_services import get_cohorts_data

def cohort_data(request):
    if request.method == 'GET':
        try:
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            quincena = request.GET.get('quincena')

            # Pasar los filtros al servicio
            data = get_cohorts_data(start_date=start_date, end_date=end_date, quincena=quincena)
            return JsonResponse(data, safe=False)
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)
