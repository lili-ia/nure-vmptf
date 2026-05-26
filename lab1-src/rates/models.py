from django.db import models


class Currency(models.Model):
    code = models.CharField(max_length=10, unique=True, verbose_name="Код валюти")
    name = models.CharField(max_length=100, verbose_name="Назва валюти")

    class Meta:
        verbose_name = "Валюта"
        verbose_name_plural = "Валюти"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"


class ExchangeRate(models.Model):
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, verbose_name="Валюта")
    date = models.DateField(verbose_name="Дата")
    buy_rate = models.DecimalField(max_digits=10, decimal_places=4, verbose_name="Курс купівлі")
    sell_rate = models.DecimalField(max_digits=10, decimal_places=4, verbose_name="Курс продажу")

    class Meta:
        verbose_name = "Курс валюти"
        verbose_name_plural = "Курси валют"
        ordering = ["-date", "currency__code"]
        unique_together = ["currency", "date"]

    def __str__(self):
        return f"{self.currency.code} {self.date}: купівля {self.buy_rate}, продаж {self.sell_rate}"


class DailySnapshot(models.Model):
    date = models.DateField(unique=True, verbose_name="Дата збереження")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Час збереження")
    rates = models.ManyToManyField(ExchangeRate, verbose_name="Курси валют")

    class Meta:
        verbose_name = "Снапшот дня"
        verbose_name_plural = "Снапшоти дня"
        ordering = ["-date"]

    def __str__(self):
        return f"Снапшот за {self.date}"
