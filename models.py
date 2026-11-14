import re
from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, Field, field_validator


class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CaseCreate(BaseModel):
    target_id: str = Field(..., min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    title: str = Field(..., min_length=5, max_length=140)
    candidate_id: Optional[str] = Field(default=None, max_length=64, pattern=r"^[a-zA-Z0-9_-]*$")
    observations: List[str] = Field(..., min_length=2, max_length=10)
    what_i_observed: str = Field(..., min_length=10, max_length=2000)
    possible_explanation: str = Field(..., min_length=10, max_length=2000)
    uncertainty: str = Field(..., min_length=5, max_length=1500)
    confidence: ConfidenceLevel

    @field_validator("observations")
    @classmethod
    def check_distinct_epochs(cls, v: List[str]) -> List[str]:
        cleaned = [item.strip() for item in v if item.strip()]
        if len(set(cleaned)) < 2:
            raise ValueError("Temporal comparison requires at least 2 distinct observation IDs.")
        return cleaned

    @field_validator("title", "what_i_observed", "possible_explanation", "uncertainty")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", v).strip()


class ScientificAudit(BaseModel):
    provenance_verified: bool
    matched_observation_ids: List[str]
    unverified_observation_ids: List[str]
    release_compatibility: str
    rigor_score: float = Field(..., ge=0.0, le=100.0)
    guardrail_notes: List[str]


class CaseRecord(BaseModel):
    id: str
    created_at: str
    target_id: str
    title: str
    candidate_id: Optional[str] = None
    observations: List[str]
    what_i_observed: str
    possible_explanation: str
    uncertainty: str
    confidence: ConfidenceLevel
    pair_quality: Optional[Any] = None
    scientific_audit: ScientificAudit
