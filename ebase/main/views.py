from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse(request, 'main/index.html', {})


def climbing_viz(request):
    return render(request, 'main/climbing_viz.html', {})

def d3(request):
    return render(request, 'main/d3.html', {})
