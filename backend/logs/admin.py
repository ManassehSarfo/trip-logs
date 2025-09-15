from django.contrib import admin
from .models import Driver, LogSheet, LogEntry, Stop

# Register your models here.
admin.site.register(Driver)
admin.site.register(LogSheet)
admin.site.register(LogEntry)
admin.site.register(Stop)