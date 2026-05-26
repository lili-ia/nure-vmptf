from django.shortcuts import render, redirect
from django.contrib import messages
from django.utils import timezone
from .models import ExchangeRate, DailySnapshot
from .forms import ExchangeRateForm


def index(request):
    today = timezone.localdate()
    rates = ExchangeRate.objects.filter(date=today).select_related("currency")
    form = ExchangeRateForm()

    if request.method == "POST":
        if "add_rate" in request.POST:
            form = ExchangeRateForm(request.POST)
            if form.is_valid():
                rate = form.save(commit=False)
                rate.date = today
                try:
                    rate.save()
                    messages.success(request, f"Курс {rate.currency.code} додано успішно.")
                except Exception:
                    existing = ExchangeRate.objects.get(currency=rate.currency, date=today)
                    existing.buy_rate = rate.buy_rate
                    existing.sell_rate = rate.sell_rate
                    existing.save()
                    messages.success(request, f"Курс {rate.currency.code} оновлено.")
                return redirect("index")

        elif "save_snapshot" in request.POST:
            if rates.exists():
                snapshot, created = DailySnapshot.objects.get_or_create(date=today)
                snapshot.rates.set(rates)
                snapshot.save()
                if created:
                    messages.success(request, f"Снапшот за {today} збережено.")
                else:
                    messages.info(request, f"Снапшот за {today} оновлено.")
            else:
                messages.warning(request, "Немає курсів для збереження.")
            return redirect("snapshots")

    return render(request, "rates/index.html", {"rates": rates, "form": form, "today": today})


def snapshots(request):
    all_snapshots = DailySnapshot.objects.prefetch_related("rates__currency").all()
    return render(request, "rates/snapshots.html", {"snapshots": all_snapshots})


def delete_rate(request, pk):
    if request.method == "POST":
        ExchangeRate.objects.filter(pk=pk).delete()
        messages.success(request, "Курс видалено.")
    return redirect("index")
