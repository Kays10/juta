from __future__ import annotations

from django.contrib.auth.decorators import login_required, permission_required
from django.http import Http404, HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from .forms import LearnerRegistrationForm
from .models import Learner


def register(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        form = LearnerRegistrationForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect("learners:registration_success")
    else:
        form = LearnerRegistrationForm()

    return render(
        request,
        "learners/register.html",
        {"form": form},
    )


def registration_success(request: HttpRequest) -> HttpResponse:
    return render(request, "learners/registration_success.html")


@login_required
@permission_required("learners.view_learner", raise_exception=True)
def management_dashboard(request: HttpRequest) -> HttpResponse:
    stream = request.GET.get("stream") or ""
    search = request.GET.get("search") or ""

    learners = Learner.objects.all().select_related(
        "contact_information",
        "progress",
    )
    if stream in {Learner.STREAM_IT, Learner.STREAM_MATHS}:
        learners = learners.filter(stream=stream)
    if search:
        learners = learners.filter(
            surname__icontains=search,
        ) | learners.filter(first_name__icontains=search)

    learners = learners.order_by("-created_at")[:200]

    return render(
        request,
        "learners/management_dashboard.html",
        {
            "learners": learners,
            "stream": stream,
            "search": search,
        },
    )


@login_required
@permission_required("learners.view_learner", raise_exception=True)
def management_learner_detail(request: HttpRequest, pk: int) -> HttpResponse:
    learner = get_object_or_404(
        Learner.objects.select_related(
            "contact_information",
            "progress",
        ).prefetch_related("documents", "previous_employment"),
        pk=pk,
    )
    return render(
        request,
        "learners/management_learner_detail.html",
        {
            "learner": learner,
        },
    )
