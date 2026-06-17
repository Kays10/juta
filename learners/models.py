from __future__ import annotations

from pathlib import Path
from typing import Any

from django.db import models


class Learner(models.Model):
    STREAM_IT = "IT"
    STREAM_MATHS = "MATHS"
    STREAM_CHOICES = [
        (STREAM_IT, "IT"),
        (STREAM_MATHS, "Maths"),
    ]

    GENDER_MALE = "M"
    GENDER_FEMALE = "F"
    GENDER_OTHER = "O"
    GENDER_CHOICES = [
        (GENDER_MALE, "Male"),
        (GENDER_FEMALE, "Female"),
        (GENDER_OTHER, "Other"),
    ]

    EMPLOYMENT_UNEMPLOYED = "UNEMPLOYED"
    EMPLOYMENT_EMPLOYED = "EMPLOYED"
    EMPLOYMENT_STUDENT = "STUDENT"
    EMPLOYMENT_CHOICES = [
        (EMPLOYMENT_UNEMPLOYED, "Unemployed"),
        (EMPLOYMENT_EMPLOYED, "Employed"),
        (EMPLOYMENT_STUDENT, "Student"),
    ]

    stream = models.CharField(max_length=10, choices=STREAM_CHOICES)

    first_name = models.CharField(max_length=150)
    middle_name = models.CharField(max_length=150, blank=True)
    surname = models.CharField(max_length=150)
    id_number = models.CharField(max_length=20)
    tax_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField()
    race = models.CharField(max_length=50, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    previous_learnership_participation = models.BooleanField(default=False)

    next_of_kin_name = models.CharField(max_length=255)
    next_of_kin_age = models.PositiveIntegerField()
    next_of_kin_contact_number = models.CharField(max_length=50)

    employment_status = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_CHOICES,
        blank=True,
    )

    qualification_id = models.CharField(max_length=100, blank=True)
    learnership_registration_number = models.CharField(max_length=100, blank=True)
    course_name = models.CharField(max_length=255, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.first_name} {self.surname} ({self.stream})"


class ContactInformation(models.Model):
    learner = models.OneToOneField(
        Learner,
        on_delete=models.CASCADE,
        related_name="contact_information",
    )
    contact_number = models.CharField(max_length=50)
    personal_email = models.EmailField()
    work_email = models.EmailField(blank=True)
    home_address = models.CharField(max_length=255)
    street_address = models.CharField(max_length=255)
    area = models.CharField(max_length=255)
    province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)

    def __str__(self) -> str:
        return f"Contact info for {self.learner}"


class PreviousEmployment(models.Model):
    learner = models.ForeignKey(
        Learner,
        on_delete=models.CASCADE,
        related_name="previous_employment",
    )
    company_name = models.CharField(max_length=255)
    company_contact_person = models.CharField(max_length=255)
    company_contact_number = models.CharField(max_length=50)
    company_email = models.EmailField()

    def __str__(self) -> str:
        return f"{self.company_name} ({self.learner})"


def learner_document_upload_path(instance: "Document", filename: str) -> str:
    learner = instance.learner
    stream = learner.stream.lower()
    safe_type = instance.document_type.lower().replace(" ", "_")
    return str(
        Path(stream)
        / str(learner.id or "unassigned")
        / f"{safe_type}_{filename}",
    )


class Document(models.Model):
    TYPE_MATRIC = "MATRIC"
    TYPE_ID = "ID"
    TYPE_BANK = "BANK"
    TYPE_TERTIARY = "TERTIARY"
    TYPE_ADDRESS = "ADDRESS"
    DOCUMENT_TYPE_CHOICES = [
        (TYPE_MATRIC, "Certified Matric Certificate"),
        (TYPE_ID, "Certified ID Copy"),
        (TYPE_BANK, "Proof of Bank Account"),
        (TYPE_TERTIARY, "Tertiary Qualification Document"),
        (TYPE_ADDRESS, "Proof of Address"),
    ]

    learner = models.ForeignKey(
        Learner,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPE_CHOICES,
    )
    file = models.FileField(upload_to=learner_document_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.get_document_type_display()} for {self.learner}"


class LearnerProgress(models.Model):
    STATUS_NOT_STARTED = "NOT_STARTED"
    STATUS_IN_PROGRESS = "IN_PROGRESS"
    STATUS_COMPLETED = "COMPLETED"
    STATUS_ON_HOLD = "ON_HOLD"
    STATUS_AT_RISK = "AT_RISK"
    STATUS_CHOICES = [
        (STATUS_NOT_STARTED, "Not started"),
        (STATUS_IN_PROGRESS, "In progress"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_ON_HOLD, "On hold"),
        (STATUS_AT_RISK, "At risk"),
    ]

    learner = models.OneToOneField(
        Learner,
        on_delete=models.CASCADE,
        related_name="progress",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NOT_STARTED,
    )
    completion_percentage = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"Progress for {self.learner}"
