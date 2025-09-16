from django.db import models

class Driver(models.Model):
    name = models.CharField(max_length=100)
    cycle_hours_used = models.FloatField(default=0)

    def __str__(self):
        return self.name


class LogSheet(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name="logsheets")
    date = models.DateField(auto_now_add=True)
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255, blank=True, null=True)
    total_hours = models.FloatField(default=0)

    def __str__(self):
        return f"{self.driver.name} - {self.date}"


class LogEntry(models.Model):
    ACTIVITY_CHOICES = [
        ("driving", "Driving"),
        ("on_duty", "On Duty"),
        ("off_duty", "Off Duty"),
        ("rest", "Rest"),
        ("sleeper", "Sleeper"),
    ]

    logsheet = models.ForeignKey(LogSheet, on_delete=models.CASCADE, related_name="entries")
    day = models.PositiveIntegerField()  # Day index relative to trip
    start_hour = models.FloatField()     # e.g., 4.77 → 4:46am
    end_hour = models.FloatField()
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["day", "start_hour"]

class Stop(models.Model):
    STOP_TYPES = [
        ("rest", "Rest"),
        ("fuel", "Fuel"),
        ("pickup", "Pickup"),
        ("dropoff", "Dropoff"),
    ]
    logsheet = models.ForeignKey(LogSheet, on_delete=models.CASCADE, related_name="stops")
    latitude = models.FloatField()
    longitude = models.FloatField()
    type = models.CharField(max_length=20, choices=STOP_TYPES)
    duration_hours = models.FloatField(default=0)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.type} at ({self.latitude},{self.longitude})"