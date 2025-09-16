import requests
import os
from dotenv import load_dotenv

load_dotenv()

ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

MAX_DRIVING_HOURS = 11
FUEL_LIMIT_MILES = 1000
AVG_SPEED_MPH = 55.0


def fetch_route(current, pickup, dropoff, timeout=10):
    coords = [
        [current["lon"], current["lat"]],
        [pickup["lon"], pickup["lat"]],
        [dropoff["lon"], dropoff["lat"]],
    ]
    payload = {
        "coordinates": coords,
        "instructions": True,
        "radiuses": [1000, 1000, 1000],
    }

    headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
    try:
        r = requests.post(ORS_URL, json=payload, headers=headers, timeout=timeout)
        if r.status_code == 404:
            raise Exception(f"Route not found. Check coordinates and API key. Payload: {payload}")
        r.raise_for_status()
        return r.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Route API error: {str(e)}. Payload: {payload}")


def generate_stops_from_route(route_json, current_cycle_hours=0):
    stops = []
    hours_driven = current_cycle_hours
    miles_since_fuel = 0.0

    segments = route_json["routes"][0]["segments"]

    for seg in segments:
        seg_distance_m = seg.get("distance", 0)
        seg_duration_s = seg.get("duration", 0)
        seg_miles = seg_distance_m / 1609.34
        seg_hours = seg_duration_s / 3600.0

        miles_since_fuel += seg_miles
        hours_driven += seg_hours

        # fuel stop(s)
        if miles_since_fuel >= FUEL_LIMIT_MILES:
            stops.append({
                "type": "fuel",
                "longitude": seg["steps"][-1].get("way_points", [0, 0])[0],
                "latitude": seg["steps"][-1].get("way_points", [0, 0])[1],
                "duration_hours": 1.0,
                "notes": "Auto inserted fuel stop",
            })
            miles_since_fuel = 0.0

        # rest stop(s)
        if hours_driven >= MAX_DRIVING_HOURS:
            stops.append({
                "type": "rest",
                "longitude": seg["steps"][-1].get("way_points", [0, 0])[0],
                "latitude": seg["steps"][-1].get("way_points", [0, 0])[1],
                "duration_hours": 10.0,
                "notes": "Auto inserted rest stop for HOS limits",
            })
            hours_driven = 0.0

    return stops


def build_route_instructions(route_json):
    """Extract summary + steps into a clean dict for frontend map rendering."""
    route = route_json["routes"][0]

    route_points = []
    for segment in route["segments"]:
        for step in segment["steps"]:
            route_points.append({
                "instruction": step["instruction"],
                "distance": step.get("distance", 0),
                "duration": step.get("duration", 0),
            })

    return {
        "summary": route.get("summary", {}),
        "bbox": route_json.get("bbox", []),
        "geometry": route.get("geometry", None),
        "points": route_points,
    }


def build_daily_logs(route_json, stops, current_cycle_hours=0):
    """Generate simplified ELD-style daily logs."""
    segments = route_json["routes"][0]["segments"]

    PICKUP_HOURS = 1
    DROPOFF_HOURS = 1
    FUEL_STOP_HOURS = 1
    MAX_DRIVING_PER_DAY = 11

    total_distance_km = sum(seg["distance"] for seg in segments) / 1000
    avg_speed_kmh = 60
    total_trip_hours = total_distance_km / avg_speed_kmh + PICKUP_HOURS + DROPOFF_HOURS

    remaining_hours = total_trip_hours
    day = 1
    dailyLogs = []

    while remaining_hours > 0 and day <= 8:
        entries = []
        current_start = 0.0

        # Pickup first day
        if day == 1:
            entries.append({"startHour": current_start, "endHour": current_start + PICKUP_HOURS, "status": "onduty"})
            current_start += PICKUP_HOURS
            remaining_hours -= PICKUP_HOURS

        # Driving
        drive_hours = min(MAX_DRIVING_PER_DAY, remaining_hours, 24 - current_start)
        if drive_hours > 0:
            entries.append({"startHour": current_start, "endHour": current_start + drive_hours, "status": "driving"})
            current_start += drive_hours
            remaining_hours -= drive_hours

        # Fuel stop
        if current_start + FUEL_STOP_HOURS <= 24 and drive_hours > 0:
            entries.append({"startHour": current_start, "endHour": current_start + FUEL_STOP_HOURS, "status": "onduty"})
            current_start += FUEL_STOP_HOURS

        # Rest until end of day
        if current_start < 24:
            entries.append({"startHour": current_start, "endHour": 24, "status": "sleeper"})

        dailyLogs.append({"day": day, "entries": entries})
        day += 1

    return dailyLogs


def plan_and_persist_trip(current, pickup, dropoff, current_cycle_hours, driver):
    from .models import LogSheet, Stop

    route_json = fetch_route(current, pickup, dropoff)
    stops = generate_stops_from_route(route_json, current_cycle_hours)

    # Persist LogSheet
    logsheet = LogSheet.objects.create(
        driver=driver,
        start_location=f"{pickup['lat']},{pickup['lon']}",
        end_location=f"{dropoff['lat']},{dropoff['lon']}"
    )

    # Persist Stops
    for s in stops:
        Stop.objects.create(
            logsheet=logsheet,
            latitude=s["latitude"],
            longitude=s["longitude"],
            type=s["type"],
            duration_hours=s["duration_hours"],
            notes=s.get("notes", ""),
        )

    route = build_route_instructions(route_json)
    dailyLogs = build_daily_logs(route_json, stops, current_cycle_hours)

    return {
        "route": route,
        "stops": stops,
        "dailyLogs": dailyLogs,
        "meta": {
            "driver": getattr(driver, "name", str(driver)),
            "assumptions": {
                "cycle_hours_limit": 70,
                "max_driving_hours_per_day": MAX_DRIVING_HOURS,
                "pickup_hours": 1,
                "dropoff_hours": 1,
                "fuel_miles": FUEL_LIMIT_MILES,
            }
        }
    }
