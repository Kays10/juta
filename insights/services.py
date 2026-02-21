from __future__ import annotations

from typing import Any

from django.db.models import QuerySet

from learners.models import Learner


def summarise_cohort(learners: QuerySet[Learner]) -> str:
    total = learners.count()
    it_count = learners.filter(stream=Learner.STREAM_IT).count()
    maths_count = learners.filter(stream=Learner.STREAM_MATHS).count()
    lines = [
        f"Total learners: {total}",
        f"IT stream: {it_count}",
        f"Maths stream: {maths_count}",
    ]
    progress_available = learners.filter(progress__isnull=False)
    if progress_available.exists():
        completed = progress_available.filter(
            progress__status="COMPLETED",
        ).count()
        at_risk = progress_available.filter(
            progress__status="AT_RISK",
        ).count()
        lines.append(f"Completed: {completed}")
        lines.append(f"At risk: {at_risk}")
    return "\n".join(lines)


def generate_rule_based_insight(query: str, learners: QuerySet[Learner]) -> str:
    query_lower = query.lower()
    if "at risk" in query_lower:
        at_risk_learners = learners.filter(progress__status="AT_RISK")
        if not at_risk_learners.exists():
            return "No learners are currently marked as at risk."
        names = ", ".join(
            f"{l.first_name} {l.surname}" for l in at_risk_learners
        )
        return f"Learners at risk: {names}."

    if "completed" in query_lower or "completed learners" in query_lower:
        completed_learners = learners.filter(progress__status="COMPLETED")
        if not completed_learners.exists():
            return "No learners have been marked as completed yet."
        names = ", ".join(
            f"{l.first_name} {l.surname}" for l in completed_learners
        )
        return f"Completed learners: {names}."

    return summarise_cohort(learners)
