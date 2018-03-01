from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^8a_viz/$', views.climbing_viz, name="climbing_viz"),
    url(r'^d3/$', views.d3, name="d3"),
]
