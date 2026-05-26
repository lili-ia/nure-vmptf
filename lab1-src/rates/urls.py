from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("snapshots/", views.snapshots, name="snapshots"),
    path("delete/<int:pk>/", views.delete_rate, name="delete_rate"),
]
