from django.shortcuts import render


def home(request):
    return render(request, 'main/home.html', {})


def climbing_viz(request):
    return render(request, 'main/climbing_viz.html', {})


def timeline(request):
    return render(request, 'main/timeline.html', {})
