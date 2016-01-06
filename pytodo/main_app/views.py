from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponse
from pytodo.main_app.models import List, Task
import json


def main_page(request):
    user = request.user
    if user.is_authenticated():
        lists = List.objects.filter(users=user)
    else:
        lists = List.objects.filter(is_public=True)

    lsts = []
    for lst in lists:
        lst.date_formatted = lst.date_create.strftime("%d.%m.%Y")
        lst.editable = request.user in lst.editors.all()
        lsts.append(lst)

    return render(request, 'mandarin.html', {"lists": lsts})


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
                                  is_archived=False,
                                  author=request.user)
        lst.users.add(request.user)
        lst.editors.add(request.user)
        lst.save()
        return HttpResponse(lst.id, status=200)

    return HttpResponse(status=401)


def update_list(request):
    if request.user.is_authenticated():
        data = json.loads(request.POST["data"])
        lst = List.objects.get(id=data["id"])
        if request.user in lst.editors.all():
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
        if request.user == lst.author:
            lst.delete()
            return HttpResponse(status=200)

    return HttpResponse(status=401)


def archive_list(request):
    if request.user.is_authenticated():
        list_id = request.POST["id"]
        lst = List.objects.get(id=list_id)
        if request.user in lst.editors.all():
            lst.is_archived = not lst.is_archived
            lst.save()
            return HttpResponse(status=200)

    return HttpResponse(status=401)


def make_list_public(request):
    if request.user.is_authenticated():
        list_id = request.POST["id"]
        lst = List.objects.get(id=list_id)
        if request.user.is_superuser:
            lst.is_public = not lst.is_public
            lst.save()
            return HttpResponse(status=200)

    return HttpResponse(status=401)


def get_list_users(request):
    if request.user.is_authenticated():
        list_id = request.POST["id"]
        lst = List.objects.get(id=list_id)
        if request.user in lst.editors.all():
            users = [{"user": user.username,
                      "edit": user in lst.editors.all()}
                     for user in lst.users.all() if user != request.user]
            return HttpResponse(json.dumps(users), status=200)

    return HttpResponse(status=401)


def change_edit_rights(request):
    if request.user.is_authenticated():
        list_id = request.POST["id"]
        lst = List.objects.get(id=list_id)
        if request.user == lst.author:
            user = User.objects.get(username=request.POST["user"])
            if user in lst.users.all() and user != lst.author:
                if user in lst.editors.all():
                    lst.editors.remove(user)
                else:
                    lst.editors.add(user)
                lst.save()
                return HttpResponse(status=200)

    return HttpResponse(status=401)


def find_users(request):
    if request.user.is_authenticated():
        username = request.POST["user"]
        db_users = User.objects.filter(username__icontains=username)
        users = [{"user": user.username} for user in db_users if user != request.user]
        return HttpResponse(json.dumps(users), status=200)

    return HttpResponse(status=401)


def change_list_users(request):
    if request.user.is_authenticated():
        list_id = request.POST["id"]
        lst = List.objects.get(id=list_id)
        if request.user in lst.editors.all():
            user = User.objects.get(username=request.POST["user"])
            if user not in lst.users.all():
                lst.users.add(user)
            else:
                lst.users.remove(user)
                if user in lst.editors.all():
                    lst.editors.remove(user)
            lst.save()
            return HttpResponse(status=200)

    return HttpResponse(status=401)