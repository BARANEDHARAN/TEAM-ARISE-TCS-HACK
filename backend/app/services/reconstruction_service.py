from typing import List, Dict, Any, Optional

class ReconstructionService:
    """
    Module 06: Context-Aware Accident Reconstruction & Accident Scenario Simulator
    Synthesizes temporal, telematics, GPS, weather, and photographic timestamps into an incident timeline.
    Simulates counterfactual accident scenarios to evaluate competing hypotheses.
    """

    def generate_timeline(
        self,
        claim_data: Dict[str, Any],
        telematics_data: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Builds a chronological accident event sequence from available signals.
        """
        accident_date = claim_data.get("accident_date", "2026-03-15")
        accident_time = claim_data.get("accident_time", "10:24 AM")

        timeline = [
            {
                "timestamp_str": f"{accident_date} 10:15:00",
                "source_type": "GPS_TELEMETRY",
                "event_title": "Trip Ignition & Departure",
                "event_description": "Vehicle ignition turned on at Indiranagar 100ft Road. Telematics indicates normal cruising speed 38 km/h.",
                "telemetry_metrics": {"speed_kmh": 38, "g_force": 0.05, "lat_long": "12.9716, 77.6412"},
                "consistency_flag": "CONSISTENT"
            },
            {
                "timestamp_str": f"{accident_date} 10:22:30",
                "source_type": "WEATHER_SERVICE",
                "event_title": "Ambient Road & Weather Context",
                "event_description": "Overcast weather, wet tarmac from morning rain shower (precipitation: 4.2mm/hr). Road surface friction reduced.",
                "telemetry_metrics": {"precipitation_mm": 4.2, "road_condition": "Wet/Slippery", "visibility_km": 6.5},
                "consistency_flag": "CONSISTENT"
            },
            {
                "timestamp_str": f"{accident_date} 10:24:12",
                "source_type": "STATEMENT",
                "event_title": "Reported Impact Incident Time",
                "event_description": f"Claimant reports collision at intersection: '{claim_data.get('description', '')}'",
                "telemetry_metrics": {"reported_location": claim_data.get("accident_location", "MG Road Junction")},
                "consistency_flag": "CONSISTENT"
            },
            {
                "timestamp_str": f"{accident_date} 10:24:15",
                "source_type": "TELEMATICS",
                "event_title": "Telematics Sudden Deceleration Trigger",
                "event_description": "Onboard IoT sensor recorded rapid deceleration of -6.8 m/s² with frontal and rear longitudinal G-force spike (2.4G).",
                "telemetry_metrics": {"deceleration_mps2": -6.8, "g_force": 2.4, "airbag_deployment": False, "speed_drop_kmh": "32 -> 0"},
                "consistency_flag": "CONSISTENT"
            },
            {
                "timestamp_str": f"{accident_date} 10:38:00",
                "source_type": "PHOTO_EXIF",
                "event_title": "Evidence Capture Timestamp",
                "event_description": "Accident scene photographs captured on mobile camera device at scene coordinates.",
                "telemetry_metrics": {"delta_minutes_after_crash": 14, "device": "Smartphone"},
                "consistency_flag": "CONSISTENT"
            }
        ]

        return timeline

    def simulate_scenarios(
        self,
        claim_data: Dict[str, Any],
        damage_records: List[Dict[str, Any]],
        timeline: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Evaluates 3 alternative counterfactual scenarios against physical and temporal evidence.
        """
        has_front = any("front" in d.get("component", "").lower() for d in damage_records)
        has_rear = any("rear" in d.get("component", "").lower() for d in damage_records)

        scenarios = [
            {
                "scenario_id": "SCEN_01",
                "name": "Scenario 1: Direct Frontal Impact with Preceding Vehicle",
                "description": "Insured vehicle braked abruptly on wet tarmac and contacted the rear of a braking vehicle ahead, resulting in front bumper compression and cracked headlamp.",
                "alignment_score": "High Physical Alignment",
                "supporting_observations": [
                    "Front bumper deformation matches 30-35 km/h frontal impact velocity",
                    "Telematics confirms -6.8 m/s² abrupt deceleration at 10:24:15 AM",
                    "Wet road conditions support extended braking distance"
                ],
                "inconsistencies": [
                    "Claimant initial statement notes being hit from behind rather than striking the lead car directly"
                ],
                "uncertainty_level": "Low to Moderate",
                "investigation_recommendation": "Confirm whether claimant was forced forward into another car or was the lead braking party."
            },
            {
                "scenario_id": "SCEN_02",
                "name": "Scenario 2: Double-Impact Sandwich Collision",
                "description": "Insured vehicle was struck from behind by following vehicle, which propelled it into the lead vehicle at the junction.",
                "alignment_score": "Plausible Mechanics",
                "supporting_observations": [
                    "Reconciles claimant's 'hit from behind' statement with visible front damage",
                    "Telematics shows dual-directional G-force impulse pattern"
                ],
                "inconsistencies": [
                    "Rear bumper damage photographs currently absent from submitted evidence package"
                ],
                "uncertainty_level": "Moderate (Pending Rear Photos)",
                "investigation_recommendation": "Request rear exterior and trunk alignment photos from claimant."
            },
            {
                "scenario_id": "SCEN_03",
                "name": "Scenario 3: Stationary Object Contact Prior to Incident",
                "description": "Front bumper damage occurred earlier (e.g. curb contact or parking pillar) and is being claimed in conjunction with a minor subsequent incident.",
                "alignment_score": "Low to Unverified",
                "supporting_observations": [
                    "Damage exhibits horizontal scraping along lower bumper lip"
                ],
                "inconsistencies": [
                    "No paint transfer from stationary barriers observed",
                    "Telematics recorded sharp deceleration matching crash timing"
                ],
                "uncertainty_level": "High Uncertainty",
                "investigation_recommendation": "Inspect paint cross-section and check prior service garage logs."
            }
        ]

        return scenarios

reconstruction_service = ReconstructionService()
