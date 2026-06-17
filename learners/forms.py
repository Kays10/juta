from __future__ import annotations

from typing import Any

from django import forms
from django.core.exceptions import ValidationError

from .models import (
    ContactInformation,
    Document,
    Learner,
    PreviousEmployment,
)


class LearnerRegistrationForm(forms.Form):
    stream = forms.ChoiceField(
        choices=[("", "Select stream")] + Learner.STREAM_CHOICES,
        required=True,
    )

    first_name = forms.CharField(max_length=150)
    middle_name = forms.CharField(max_length=150, required=False)
    surname = forms.CharField(max_length=150)
    id_number = forms.CharField(max_length=20)
    tax_number = forms.CharField(max_length=20, required=False)
    date_of_birth = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}))
    race = forms.CharField(max_length=50, required=False)
    gender = forms.ChoiceField(choices=Learner.GENDER_CHOICES)
    previous_learnership_participation = forms.BooleanField(required=False)

    next_of_kin_name = forms.CharField(max_length=255)
    next_of_kin_age = forms.IntegerField(min_value=0)
    next_of_kin_contact_number = forms.CharField(max_length=50)

    employment_status = forms.ChoiceField(
        choices=[("", "---------")] + Learner.EMPLOYMENT_CHOICES,
        required=False,
    )

    contact_number = forms.CharField(max_length=50)
    personal_email = forms.EmailField()
    work_email = forms.EmailField(required=False)
    home_address = forms.CharField(max_length=255)
    street_address = forms.CharField(max_length=255)
    area = forms.CharField(max_length=255)
    province = forms.CharField(max_length=100)
    postal_code = forms.CharField(max_length=20)

    qualification_id = forms.CharField(max_length=100, required=False)
    learnership_registration_number = forms.CharField(max_length=100, required=False)
    course_name = forms.CharField(max_length=255, required=False)
    start_date = forms.DateField(
        widget=forms.DateInput(attrs={"type": "date"}), required=False
    )
    end_date = forms.DateField(
        widget=forms.DateInput(attrs={"type": "date"}), required=False
    )

    company_name = forms.CharField(max_length=255, required=False)
    company_contact_person = forms.CharField(max_length=255, required=False)
    company_contact_number = forms.CharField(max_length=50, required=False)
    company_email = forms.EmailField(required=False)

    matric_certificate = forms.FileField(required=True)
    id_copy = forms.FileField(required=True)
    bank_proof = forms.FileField(required=True)
    tertiary_document = forms.FileField(required=False)
    proof_of_address = forms.FileField(required=True)

    def clean(self) -> dict[str, Any]:
        cleaned_data = super().clean()
        stream = cleaned_data.get("stream")
        start_date = cleaned_data.get("start_date")
        end_date = cleaned_data.get("end_date")

        if stream != Learner.STREAM_MATHS:
            required_fields = [
                "qualification_id",
                "learnership_registration_number",
                "course_name",
                "start_date",
                "end_date",
            ]
            for field in required_fields:
                if not cleaned_data.get(field):
                    self.add_error(field, "This field is required.")

        if start_date and end_date and end_date < start_date:
            raise ValidationError("End date cannot be before start date.")
        return cleaned_data

    def _validate_pdf(self, field_name: str) -> None:
        file = self.files.get(field_name)
        if not file:
            return
        if not file.name.lower().endswith(".pdf"):
            raise ValidationError("Only PDF files are allowed.")
        content_type = getattr(file, "content_type", "")
        if content_type and content_type != "application/pdf":
            raise ValidationError("Only PDF files are allowed.")

    def clean_matric_certificate(self) -> Any:
        self._validate_pdf("matric_certificate")
        return self.files.get("matric_certificate")

    def clean_id_copy(self) -> Any:
        self._validate_pdf("id_copy")
        return self.files.get("id_copy")

    def clean_bank_proof(self) -> Any:
        self._validate_pdf("bank_proof")
        return self.files.get("bank_proof")

    def clean_tertiary_document(self) -> Any:
        file = self.files.get("tertiary_document")
        if not file:
            return None
        self._validate_pdf("tertiary_document")
        return file

    def clean_proof_of_address(self) -> Any:
        self._validate_pdf("proof_of_address")
        return self.files.get("proof_of_address")

    def save(self) -> Learner:
        data = self.cleaned_data

        learner = Learner.objects.create(
            stream=data["stream"],
            first_name=data["first_name"],
            middle_name=data.get("middle_name", ""),
            surname=data["surname"],
            id_number=data["id_number"],
            tax_number=data.get("tax_number", ""),
            date_of_birth=data["date_of_birth"],
            race=data.get("race", ""),
            gender=data["gender"],
            previous_learnership_participation=data.get(
                "previous_learnership_participation",
                False,
            ),
            next_of_kin_name=data["next_of_kin_name"],
            next_of_kin_age=data["next_of_kin_age"],
            next_of_kin_contact_number=data["next_of_kin_contact_number"],
            employment_status=data.get("employment_status") or "",
            qualification_id=data.get("qualification_id", ""),
            learnership_registration_number=data.get(
                "learnership_registration_number", ""
            ),
            course_name=data.get("course_name", ""),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
        )

        ContactInformation.objects.create(
            learner=learner,
            contact_number=data["contact_number"],
            personal_email=data["personal_email"],
            work_email=data.get("work_email", ""),
            home_address=data["home_address"],
            street_address=data["street_address"],
            area=data["area"],
            province=data["province"],
            postal_code=data["postal_code"],
        )

        if data.get("company_name"):
            PreviousEmployment.objects.create(
                learner=learner,
                company_name=data["company_name"],
                company_contact_person=data["company_contact_person"],
                company_contact_number=data["company_contact_number"],
                company_email=data["company_email"],
            )

        Document.objects.create(
            learner=learner,
            document_type=Document.TYPE_MATRIC,
            file=self.files["matric_certificate"],
        )
        Document.objects.create(
            learner=learner,
            document_type=Document.TYPE_ID,
            file=self.files["id_copy"],
        )
        Document.objects.create(
            learner=learner,
            document_type=Document.TYPE_BANK,
            file=self.files["bank_proof"],
        )
        if self.files.get("tertiary_document"):
            Document.objects.create(
                learner=learner,
                document_type=Document.TYPE_TERTIARY,
                file=self.files["tertiary_document"],
            )
        Document.objects.create(
            learner=learner,
            document_type=Document.TYPE_ADDRESS,
            file=self.files["proof_of_address"],
        )

        return learner

