from __future__ import annotations

from django.urls import path

from . import views

app_name = "learners"

urlpatterns = [
    path("", views.register, name="register"),
    path("success/", views.registration_success, name="registration_success"),
]

