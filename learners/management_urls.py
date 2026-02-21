from __future__ import annotations

from django.urls import path

from . import views

app_name = "management"

urlpatterns = [
    path("", views.management_dashboard, name="dashboard"),
    path(
        "learners/<int:pk>/",
        views.management_learner_detail,
        name="learner_detail",
    ),
]

