from django import forms
from .models import ExchangeRate, Currency


class ExchangeRateForm(forms.ModelForm):
    class Meta:
        model = ExchangeRate
        fields = ["currency", "buy_rate", "sell_rate"]
        widgets = {
            "currency": forms.Select(attrs={"class": "form-select"}),
            "buy_rate": forms.NumberInput(attrs={"class": "form-control", "step": "0.0001"}),
            "sell_rate": forms.NumberInput(attrs={"class": "form-control", "step": "0.0001"}),
        }
        labels = {
            "currency": "Валюта",
            "buy_rate": "Курс купівлі (грн)",
            "sell_rate": "Курс продажу (грн)",
        }
