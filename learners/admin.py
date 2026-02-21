from __future__ import annotations

from django.contrib import admin

from .models import (
    ContactInformation,
    Document,
    Learner,
    LearnerProgress,
    PreviousEmployment,
)


class ContactInformationInline(admin.StackedInline):
    model = ContactInformation
    extra = 0


class PreviousEmploymentInline(admin.StackedInline):
    model = PreviousEmployment
    extra = 0


class DocumentInline(admin.TabularInline):
    model = Document
    extra = 0


class LearnerProgressInline(admin.StackedInline):
    model = LearnerProgress
    extra = 0
    max_num = 1


@admin.register(Learner)
class LearnerAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "surname",
        "stream",
        "id_number",
        "course_name",
        "start_date",
        "end_date",
    )
    list_filter = ("stream", "course_name", "start_date", "end_date")
    search_fields = ("first_name", "surname", "id_number")
    inlines = [
        ContactInformationInline,
        PreviousEmploymentInline,
        LearnerProgressInline,
        DocumentInline,
    ]
    actions = ["export_as_csv"]

    def export_as_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="learners_export.csv"'
        )

        writer = csv.writer(response)
        writer.writerow(
            [
                "First name",
                "Middle name",
                "Surname",
                "Stream",
                "ID number",
                "Tax number",
                "DOB",
                "Race",
                "Gender",
                "Previous learnership",
                "Next of kin name",
                "Next of kin age",
                "Next of kin contact",
                "Employment status",
                "Qualification ID",
                "Learnership registration number",
                "Course name",
                "Start date",
                "End date",
            ]
        )
        for learner in queryset:
            writer.writerow(
                [
                    learner.first_name,
                    learner.middle_name,
                    learner.surname,
                    learner.stream,
                    learner.id_number,
                    learner.tax_number,
                    learner.date_of_birth,
                    learner.race,
                    learner.gender,
                    learner.previous_learnership_participation,
                    learner.next_of_kin_name,
                    learner.next_of_kin_age,
                    learner.next_of_kin_contact_number,
                    learner.employment_status,
                    learner.qualification_id,
                    learner.learnership_registration_number,
                    learner.course_name,
                    learner.start_date,
                    learner.end_date,
                ]
            )
        return response

    export_as_csv.short_description = "Export selected learners as CSV"


@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
    list_display = ("learner", "contact_number", "personal_email", "province")
    search_fields = ("learner__first_name", "learner__surname")


@admin.register(PreviousEmployment)
class PreviousEmploymentAdmin(admin.ModelAdmin):
    list_display = ("learner", "company_name", "company_contact_person")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("learner", "document_type", "uploaded_at")
    list_filter = ("document_type",)
