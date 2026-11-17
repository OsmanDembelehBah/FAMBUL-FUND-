"""
G4 Innovation: SatelliteAdapter (Plot Proof & NDVI Health Verification)
Simulates Sentinel-2 multispectral remote sensing for farm plots in Sierra Leone.
"""

from typing import Dict, Any
import hashlib


def assess_plot_ndvi(lat: float, lon: float, crop: str = "Rice") -> Dict[str, Any]:
    """
    Computes mock Sentinel-2 NDVI (Normalized Difference Vegetation Index) for verified farm boundaries.
    """
    # Deterministic pseudo-sensing based on coordinates hash
    coord_key = f"{lat:.4f}:{lon:.4f}:{crop}"
    hash_val = int(hashlib.sha256(coord_key.encode()).hexdigest()[:8], 16)

    # Scale between 0.40 and 0.88 for realistic lush tropical vegetation
    base_ndvi = 0.50 + ((hash_val % 38) / 100.0)
    ndvi = round(base_ndvi, 2)

    # Classify canopy status
    if ndvi >= 0.70:
        health_status = "Vigorous Healthy Canopy"
        stress_level = "NONE"
        drought_trigger = False
        summary = f"Satellite verified dense, vigorous vegetative growth for {crop}. High expected harvest yield."
    elif ndvi >= 0.50:
        health_status = "Moderate Growth"
        stress_level = "LOW"
        drought_trigger = False
        summary = f"Vegetation index within normal bounds. Canopy coverage adequate."
    else:
        health_status = "Moisture Stress / Vegetation Deficit"
        stress_level = "HIGH"
        drought_trigger = True
        summary = f"Low chlorophyll reflectance detected. Drought condition or pest outbreak suspected."

    canopy_cover = round(min(98.0, ndvi * 115.0), 1)

    return {
        "coordinates": {"lat": lat, "lon": lon},
        "crop": crop,
        "satellite_constellation": "Copernicus Sentinel-2B",
        "band_ratio": "NIR (Band 8) vs RED (Band 4)",
        "ndvi_value": ndvi,
        "canopy_coverage_pct": canopy_cover,
        "health_status": health_status,
        "stress_level": stress_level,
        "drought_trigger_flag": drought_trigger,
        "observation_date": "2026-11-15T10:30:00Z",
        "cloud_cover_pct": 4.2,
        "summary": summary,
        "plot_verified": True,
    }
