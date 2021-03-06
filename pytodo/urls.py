"""pytodo URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import url
from django.contrib import admin
from pytodo.main_app.views import *


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', main_page),
    url(r'^login/', log_in),
    url(r'^logout/', log_out),
    url(r'^list/update/', update_list),
    url(r'^list/new/', new_list),
    url(r'^list/delete/', delete_list),
    url(r'^list/archive/', archive_list),
    url(r'^list/make_public/', make_list_public),
    url(r'^list/users/all/', get_list_users),
    url(r'^list/users/change_edit_rights/', change_edit_rights),
    url(r'^list/users/find/', find_users),
    url(r'^list/users/change_list_users/', change_list_users)
]
