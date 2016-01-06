from django.db import models
from django.contrib.auth.models import User


class List(models.Model):
    title = models.CharField(max_length=100)
    is_public = models.BooleanField()
    is_archived = models.BooleanField()
    date_create = models.DateField(auto_now_add=True)
    date_change = models.DateField(auto_now=True)
    author = models.ForeignKey(User,
                               on_delete=models.CASCADE,
                               related_name='gameclaim_author')
    users = models.ManyToManyField(User,
                                   related_name='gameclaim_users')
    editors = models.ManyToManyField(User,
                                     related_name='gameclaim_editors')

    def __str__(self):
        return "Author: {} || {}".format(self.author.username, self.title)


class Task(models.Model):
    text = models.CharField(max_length=255)
    is_done = models.BooleanField()
    list = models.ForeignKey(List,
                             on_delete=models.CASCADE)
