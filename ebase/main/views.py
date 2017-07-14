from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse('hello world')


def climbing_viz(request):
    return render(request, 'main/climbing_viz.html', {})
