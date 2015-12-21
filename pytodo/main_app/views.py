from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from pytodo.main_app.models import List, Task
import json


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


def new_list(request):
    if request.user.is_authenticated():
        lst = List.objects.create(title="",
                                  is_public=False,
                                  author=request.user)
        lst.users.add(request.user)
        lst.save()
        return HttpResponse(lst.id, status=200)

    return HttpResponse(status=401)


def update_list(request):
    if request.user.is_authenticated():
        data = json.loads(request.POST["data"])
        lst = List.objects.get(id=data["id"])
        if lst.author == request.user:
            lst.title = data["title"]
            lst.is_public = data["is_public"]

            # Так делать плохо и надо сделать нормально изменение тасков, но пока пусть так
            tasks = lst.task_set.all()
            for task in tasks:
                task.delete()

            for task in data["tasks"]:
                tsk = Task.objects.create(text=task["text"],
                                          is_done=task["is_done"],
                                          list=lst)
                tsk.save()
            lst.save()

            return HttpResponse(status=200)

    return HttpResponse(status=401)


def delete_list(request):
    if request.user.is_authenticated():
        list_id = request.POST["id"]
        lst = List.objects.get(id=list_id)
        if lst.author == request.user:
            lst.delete()
            return HttpResponse(status=200)

    return HttpResponse(status=401)