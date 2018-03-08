from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^8a_viz/$', views.climbing_viz, name="climbing_viz"),
    url(r'^timeline/$', views.timeline, name="timeline"),
]
