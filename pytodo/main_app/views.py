from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from pytodo.main_app.models import List


def main_page(request):
    user = request.user
    if user.is_authenticated():
        lists = List.objects.filter(users=user)
    else:
        lists = List.objects.filter(is_public=True)
    return render(request, 'mandarin.html', {"lists": lists})


def log_in(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return redirect('/')
        else:
            return HttpResponse(status=404)
    else:
        return HttpResponse(status=404)


def log_out(request):
    logout(request)
    return redirect('/')