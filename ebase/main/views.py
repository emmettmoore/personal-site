from django.shortcuts import render


def climbing_viz(request):
    return render(request, 'climbing_viz.html', {})
