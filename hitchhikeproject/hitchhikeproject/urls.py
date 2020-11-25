from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.urls import include, path

from hitchhikeapp import models
from hitchhikeapp import views

from rest_framework import routers

urlpatterns = [
    path('', views.index, name='index'),
    path('home', views.home, name='home'),
    path('ride/ridelist', views.ridelist, name='ridelist'),
    path('ride/rideview', views.rideview, name='rideview'),
    path('ride/ridemap', views.ridemap, name='ridemap'),
    path('ride/ridecreate', views.ridecreate, name='ridecreate'),
    path('rating/ratingview', views.ratingview, name='ratingview'),
    path('rating/ratinglist', views.ratinglist, name='ratinglist'),
    path('userinfo', views.userinfo, name='userinfo'),
    path('logout', views.logout, name='logout'),
    path('', include('django.contrib.auth.urls')),
    path('', include('social_django.urls')),

    ##########  API ###########
    path('api/getmodels', login_required(views.GetModels.as_view()), name='getmodels'),
    path('api/getmodel', login_required(views.GetModel.as_view()), name='getmodel'),
    path('api/createmodel', login_required(views.CreateModel.as_view()), name='createmodel'),
    path('api/deletemodel', login_required(views.DeleteModel.as_view()), name='deletemodel'),
    path('api/updatemodel', login_required(views.UpdateModel.as_view()), name='updatemodel'),
    path('api/executemodelmethod', login_required(views.ExecuteModelMethod.as_view()), name='executemodelmethod'),
]