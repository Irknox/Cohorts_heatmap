from django.contrib import admin
from django.urls import path
from cohorts_heatmap import views as cohorts_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('cohorts_data/',cohorts_views.cohort_data, name='cohorts_data')
]