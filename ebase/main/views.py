from django.shortcuts import render


def home(request):
    return render(request, 'main/home.html', {})


def climbing_viz(request):
    return render(request, 'main/climbing_viz.html', {})


def d3(request):
    return render(request, 'main/d3.html', {})


def resume(request):
    return render(request, 'main/resume.html', {})
