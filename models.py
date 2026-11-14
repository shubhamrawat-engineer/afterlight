import re
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class TaskType(str, Enum):
    VISUAL_BLINK = "visual_blink"
    DIFFERENCE_IMAGE = "difference_image"
    PHOTOMETRY = "photometry"
    ASTROMETRY = "astrometry"
    SPECTRAL = "spectral"


class CompatibilityState(str, Enum):
    COMPARABLE = "COMPARABLE"
    COMPARABLE_WITH_WARNINGS = "COMPARABLE_WITH_WARNINGS"
    NOT_COMPARABLE = "NOT_COMPARABLE"
    INSUFFICIENT_METADATA = "INSUFFICIENT_METADATA"
    NOT_TESTED = "NOT_TESTED"


class CheckStatus(str, Enum):
    PASSED = "passed"
    WARNING = "warning"
    FAILED = "failed"
    INSUFFICIENT_METADATA = "insufficient_metadata"
    NOT_TESTED = "not_tested"


class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CheckResult(BaseModel):
    name: str = Field(..., description="Machine-readable check name, e.g. wcs_alignment, wavelength_matching")
    status: CheckStatus
    evidence_used: Optional[str] = Field(None, description="Actual metadata value or diagnostic used")
    rule_version: str = Field(default="v1.0", description="Version of the scientific validation rule")
    reason: str = Field(..., description="Actionable human-readable explanation")


class CompatibilityReport(BaseModel):
    task: TaskType
    status: CompatibilityState
    checks: List[CheckResult]
    reasons: List[str]
    warnings: List[str]
    permitted: bool = Field(..., description="Whether the requested task/operation is scientifically permitted")


class MeasurementResult(BaseModel):
    observable: str = Field(..., description="Named observable, e.g. source_flux_difference, centroid_offset")
    value: Optional[float] = Field(None, description="Measured numerical value")
    unit: str = Field(..., description="Explicit scientific unit, e.g. mJy, arcsec")
    uncertainty: Optional[float] = Field(None, description="Combined 1-sigma measurement uncertainty")
    uncertainty_unit: str = Field(..., description="Unit of uncertainty, e.g. mJy, arcsec")
    uncertainty_terms: List[str] = Field(default_factory=list, description="Included uncertainty components (error budget)")
    method: str = Field(..., description="Explicit, reproducible measurement algorithm and software version")
    quality_flags: List[str] = Field(default_factory=list, description="Data quality and mask indicators")
    limitations: List[str] = Field(default_factory=list, description="Scientific caveats and constraints")
    is_refused: bool = Field(default=False, description="True if measurement could not be performed due to compatibility/quality failure")
    refusal_reason: Optional[str] = Field(None, description="Explanation when measurement is refused")


class CaseCreate(BaseModel):
    target_id: str = Field(..., min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    title: str = Field(..., min_length=5, max_length=140)
    candidate_id: Optional[str] = Field(default=None, max_length=64, pattern=r"^[a-zA-Z0-9_-]*$")
    task: TaskType = Field(default=TaskType.DIFFERENCE_IMAGE, description="The specific operation evaluated")
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


class EvidenceReport(BaseModel):
    investigation_id: str
    target_id: str
    title: str
    created_at: str
    task: TaskType
    observations_used: List[Dict[str, Any]]
    compatibility: CompatibilityReport
    measurement: MeasurementResult
    guardrail_warnings: List[str]
    limitations: List[str]
    plain_language_summary: str
    provenance: Dict[str, Any]


class CaseRecord(BaseModel):
    id: str
    created_at: str
    target_id: str
    title: str
    candidate_id: Optional[str] = None
    task: TaskType = TaskType.DIFFERENCE_IMAGE
    observations: List[str]
    what_i_observed: str
    possible_explanation: str
    uncertainty: str
    confidence: ConfidenceLevel
    pair_quality: Optional[Any] = None
    compatibility: CompatibilityReport
    measurement: MeasurementResult
    guardrail_warnings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    provenance: Dict[str, Any] = Field(default_factory=dict)
