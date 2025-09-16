from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Driver, LogSheet, LogEntry, Stop
from .serializers import (
    DriverSerializer, LogSheetSerializer, LogEntrySerializer, StopSerializer,
    TripLogsRequestSerializer
)
from .services import plan_and_persist_trip

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

class LogSheetViewSet(viewsets.ModelViewSet):
    queryset = LogSheet.objects.all()
    serializer_class = LogSheetSerializer

class LogEntryViewSet(viewsets.ModelViewSet):
    queryset = LogEntry.objects.all()
    serializer_class = LogEntrySerializer

class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.all()
    serializer_class = StopSerializer

class TripLogsView(APIView):
    """
    POST /api/trips/logs/
    body: { current_location: {lat, lon}, pickup_location: {...}, dropoff_location: {...}, current_cycle_hours, driver_id, driver_name }
    """
    def post(self, request):
        serializer = TripLogsRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        driver = None
        # Try to get driver by ID
        driver_id = data.get("driver_id")
        if driver_id:
            driver = get_object_or_404(Driver, pk=driver_id)
        else:
            # If driver_name is provided, create new driver
            driver_name = data.get("driver_name")
            if driver_name:
                driver, _ = Driver.objects.get_or_create(name=driver_name)
            else:
                return Response({"error": "Driver information missing"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = plan_and_persist_trip(
                data["current_location"],
                data["pickup_location"],
                data["dropoff_location"],
                data["current_cycle_hours"],
                driver
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
