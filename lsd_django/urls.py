"""
URL configuration for lsd_django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from lsd_app import views as usr
from admins import views as admins
from lsd_django import views as mainView
from django.contrib.staticfiles.urls import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    # path("index/", mainView.index, name="index"),
    path("", mainView.index, name="index"),
    path("AdminLogin/", mainView.AdminLogin, name="AdminLogin"),
    path("UserLogin/", mainView.UserLogin, name="UserLogin"),
    path("UserRegister/", mainView.UserRegister, name="UserRegister"),

    # Admin views
    path("AdminHome/", admins.AdminHome, name="AdminHome"),
    path("AdminLoginCheck/", admins.AdminLoginCheck, name="AdminLoginCheck"),
    path('RegisterUsersView/', admins.RegisterUsersView, name='RegisterUsersView'),
    path('ActivaUsers/', admins.ActivaUsers, name='ActivaUsers'),

    # User Views
    path("UserRegisterActions/", usr.UserRegisterActions, name="UserRegisterActions"),
    path("UserLoginCheck/", usr.UserLoginCheck, name="UserLoginCheck"),
    path("UserHome/", usr.UserHome, name="UserHome"),
    path('predict', usr.predict_api, name='predict'),
    path('register', usr.register_api, name='register'),
    path('login', usr.login_api, name='login'),
    path('admin_login', usr.admin_login_api, name='admin_login'),
    path('list_users', usr.list_users_api, name='list_users'),
    path('activate_user', usr.activate_user_api, name='activate_user'),
    path("index1/", usr.index1, name="index1"),
    path("eda/", usr.EDA, name="eda"),
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
