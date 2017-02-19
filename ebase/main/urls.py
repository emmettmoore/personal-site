from . import views

from django.conf.urls import url

url_patterns = [
    url(r'^$', views.climbing_viz, name="climbing_viz"),
]
