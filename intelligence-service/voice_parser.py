"""
Voice Ledger Natural Language Parser (Krio & English).
Extracts structured farm transactions from voice transcriptions.
Guardrail: Every parsed entry requires farmer confirmation before affecting any ledger or score.
"""

import re
from typing import Dict, Any, Optional

CROP_MAPPINGS = {
    # Rice
    "rice": "Rice",
    "rays": "Rice",
    "resi": "Rice",
    # Cassava
    "cassava": "Cassava",
    "kasada": "Cassava",
    "gari": "Cassava",
    # Cocoa
    "cocoa": "Cocoa",
    "koko": "Cocoa",
    # Oil Palm
    "palm oil": "Oil Palm",
    "pam wayl": "Oil Palm",
    "pam": "Oil Palm",
    "palmoil": "Oil Palm",
    # Cashew
    "cashew": "Cashew",
    "kashu": "Cashew",
    # Vegetables
    "vegetables": "Vegetables",
    "vedjtebul": "Vegetables",
    "pepper": "Vegetables",
    "tomato": "Vegetables",
    "okra": "Vegetables",
    # Inputs
    "fertilizer": "Inputs",
    "fetilayza": "Inputs",
    "seeds": "Inputs",
    "sid": "Inputs",
    "labor": "Inputs",
    "leba": "Inputs",
}

UNIT_MAPPINGS = {
    "bag": "bags",
    "bags": "bags",
    "baskit": "baskets",
    "basket": "baskets",
    "baskets": "baskets",
    "tin": "tins",
    "tins": "tins",
    "kg": "kg",
    "kilo": "kg",
    "kilos": "kg",
    "pan": "pans",
}

LOCATION_KEYWORDS = ["bo", "kenema", "kailahun", "kambia", "port loko", "tonkolili", "pendembu"]


def parse_voice_note(transcription: str) -> Dict[str, Any]:
    """
    Parses a transcribed voice recording into a structured ledger candidate.
    """
    text = transcription.lower().strip()

    # Determine entry type
    entry_type = "sale"
    if any(k in text for k in ["spent", "spɛnd", "pay", "bai", "buy", "bought", "cost", "fɔ leba", "fertilizer"]):
        entry_type = "expense"
    elif any(k in text for k in ["harvest", "avɛst", "kot", "cut", "pick", "pul"]):
        entry_type = "harvest"

    # Identify Crop
    crop = "Rice"  # default staple
    for key, canonical in CROP_MAPPINGS.items():
        if key in text:
            crop = canonical
            break

    # Identify Unit
    unit = "bags"
    for key, canonical in UNIT_MAPPINGS.items():
        if key in text:
            unit = canonical
            break

    # Extract Quantity (e.g., "5 bag", "10 baskets", "20 kg")
    qty = 1.0
    qty_match = re.search(r"(\d+(\.\d+)?)\s*(bag|baskit|basket|tin|kg|kilo|pan)?", text)
    if qty_match:
        try:
            qty = float(qty_match.group(1))
        except ValueError:
            qty = 1.0

    # Extract Amount SLE (e.g., "fɔ 350 leone", "for 400 SLE", "450 leone", "300")
    amount = 0.0
    amt_matches = re.findall(r"(?:fɔ|for|sle|leone|leones|cost)?\s*(\d{2,6}(?:\.\d{1,2})?)", text)
    if amt_matches:
        # Pick the largest number as price/amount if quantity was already parsed
        numbers = [float(n) for n in amt_matches]
        if entry_type in ["sale", "expense"]:
            # usually amount is larger than quantity
            candidates = [n for n in numbers if n != qty]
            amount = max(candidates) if candidates else numbers[-1]
        else:
            amount = 0.0

    # Identify Location
    location = "Bo"
    for loc in LOCATION_KEYWORDS:
        if loc in text:
            location = loc.title()
            break

    confidence = 0.94 if (crop and qty > 0) else 0.75

    return {
        "raw_text": transcription,
        "entry_type": entry_type,
        "crop": crop,
        "quantity": qty,
        "unit": unit,
        "amount": amount,
        "location": location,
        "currency": "SLE",
        "confidence": confidence,
        "farmer_confirmation_required": True,
        "explainer": f"Detected {entry_type} of {qty:g} {unit} of {crop} for SLE {amount:,.2f} in {location}.",
    }
