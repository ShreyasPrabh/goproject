from django.contrib import admin
from .models import ImageAnalysis


@admin.register(ImageAnalysis)
class ImageAnalysisAdmin(admin.ModelAdmin):
    list_display = ['filename', 'upload_time', 'is_real', 'is_edited', 'analysis_status']
    list_filter = ['is_real', 'is_edited', 'analysis_status', 'upload_time']
    search_fields = ['filename']
    readonly_fields = ['upload_time']
    
    fieldsets = (
        ('Image Information', {
            'fields': ('image', 'filename', 'upload_time')
        }),
        ('Analysis Results', {
            'fields': ('is_real', 'real_confidence', 'is_edited', 'edited_confidence')
        }),
        ('Status', {
            'fields': ('analysis_status', 'error_message')
        }),
    )