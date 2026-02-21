from __future__ import annotations

from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

from learners.models import Learner

from .services import generate_rule_based_insight


@login_required
def insights_dashboard(request: HttpRequest) -> HttpResponse:
    query = request.GET.get("q", "").strip()
    learners = Learner.objects.all()
    insight = ""
    if query:
        insight = generate_rule_based_insight(query, learners)
    return render(
        request,
        "insights/dashboard.html",
        {
            "query": query,
            "insight": insight,
        },
    )

