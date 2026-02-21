from __future__ import annotations

from django.urls import path

from .views import insights_dashboard

app_name = "insights"

urlpatterns = [
    path("", insights_dashboard, name="dashboard"),
]

