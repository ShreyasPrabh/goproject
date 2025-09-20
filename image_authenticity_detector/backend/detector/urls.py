from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_image, name='analyze_image'),
    path('history/', views.get_analysis_history, name='analysis_history'),
    path('analysis/<int:analysis_id>/', views.get_analysis, name='get_analysis'),
    path('health/', views.health_check, name='health_check'),
]