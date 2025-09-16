from rest_framework import serializers
from .models import Driver, LogSheet, LogEntry, Stop

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = "__all__"

class LogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEntry
        fields = "__all__"

class LogSheetSerializer(serializers.ModelSerializer):
    entries = LogEntrySerializer(many=True, read_only=True)
    stops = StopSerializer(many=True, read_only=True)

    class Meta:
        model = LogSheet
        fields = ["id", "driver", "date", "start_location", "end_location", "entries", "stops"]


class TripLogsRequestSerializer(serializers.Serializer):
    current_location = serializers.DictField()
    pickup_location = serializers.DictField()
    dropoff_location = serializers.DictField()
    current_cycle_hours = serializers.FloatField()
    driver_name = serializers.CharField()
