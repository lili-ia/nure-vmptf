from django.contrib import admin
from .models import Currency, ExchangeRate, DailySnapshot


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ["code", "name"]
    search_fields = ["code", "name"]


@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ["currency", "date", "buy_rate", "sell_rate"]
    list_filter = ["date", "currency"]
    date_hierarchy = "date"


@admin.register(DailySnapshot)
class DailySnapshotAdmin(admin.ModelAdmin):
    list_display = ["date", "created_at"]
    filter_horizontal = ["rates"]
