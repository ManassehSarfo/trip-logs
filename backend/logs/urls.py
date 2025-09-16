from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DriverViewSet,
    LogSheetViewSet,
    LogEntryViewSet,
    StopViewSet,
    TripLogsView,
)

router = DefaultRouter()
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'logsheets', LogSheetViewSet, basename='logsheet')
router.register(r'logentries', LogEntryViewSet, basename='logentry')
router.register(r'stops', StopViewSet, basename='stop')

urlpatterns = [
    path('trip/logs/', TripLogsView.as_view(), name='trip_logs'),
    path('logsheets/<int:pk>/stops/', StopViewSet.as_view({'get': 'list'}), name='logsheet-stops'),
    path('logsheets/by-driver/', LogSheetViewSet.as_view({'get': 'by_driver'}), name='logsheets-by-driver'),

    # To update the created models (driver, logsheet, logentry, stop)
    path('models/', include(router.urls)),
]
