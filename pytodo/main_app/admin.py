from django.contrib import admin
from pytodo.main_app.models import List, Task


admin.site.register(List)
admin.site.register(Task)