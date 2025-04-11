from django.http import JsonResponse
from .services.cohort_heatmap_services import get_cohorts_data

def cohort_data(request):
    if request.method == 'GET':
        try:
            data = get_cohorts_data()
            return JsonResponse(data, safe=False)
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)