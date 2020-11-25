from django.shortcuts import render, redirect
from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as logout_
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth.models import User
from django.utils.dateparse import parse_date

from urllib.parse import urlencode

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework import authentication, permissions
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.parsers import JSONParser
from rest_framework import status as httpstatus

from hitchhikeapp import models

from functools import wraps
import jwt
import json

@login_required
def home(request):
	uri_absolute = request.build_absolute_uri()
	return render(request, 'home.html', concat_page_params(request, { 
		'base_uri_absolute': uri_absolute 
	}))

@login_required
def ridelist(request):
	startZip = request.GET.get('startZip') if request.GET.get('startZip') != None else '' 
	endZip = request.GET.get('endZip') if request.GET.get('endZip') != None else '' 

	uri_absolute = request.build_absolute_uri()
	return render(request, 'ride/ridelist.html', concat_page_params(request, { 
		'base_uri_absolute': uri_absolute 
		, 'startZip': startZip
		, 'endZip': endZip
	}))

@login_required
def ridemap(request):
	uri_absolute = request.build_absolute_uri()
	return render(request, 'ride/ridemap.html', concat_page_params(request, { 
		'base_uri_absolute': uri_absolute 
	}))

@login_required
def rideview(request):
	rideId = request.GET.get('id') if request.GET.get('id') != None else '' 
	return render(request, 'ride/rideview.html', concat_page_params(request, {
		'rideId': rideId
	}))

@login_required
def ridecreate(request):
	return render(request, 'ride/ridecreate.html', concat_page_params(request, {}))


@login_required
def ratingview(request):
	return render(request, 'rating/ratingview.html', concat_page_params(request, {}))

@login_required
def ratinglist(request):
	return render(request, 'rating/ratinglist.html', concat_page_params(request, {}))

@login_required
def userinfo(request):
	return render(request, 'user/userinfo.html', concat_page_params(request, {}))

def index(request):
	user = request.user

	if user.is_authenticated:
		auth0user = user.social_auth.get(provider='auth0')
		user_data = get_user_data(auth0user, user)
		#Create userData record in DB if not exist
		userdata_class = model_name_to_class_safe('UserData')
		try:
			userdata_record = userdata_class.objects.get(userId=user_data['user_id'])
		except Exception:
			userdata_record = userdata_class()
			userdata_record.userId = user_data['user_id']
		userdata_record.userName = user_data['name']
		userdata_record.save()

		return redirect(home)
	else:
		return render(request, 'index.html')

def logout(request):
    logout_(request)
    return_to = urlencode({'returnTo': request.build_absolute_uri('/')})
    logout_url = 'https://' + settings.SOCIAL_AUTH_AUTH0_DOMAIN + '/v2/logout?client_id=' + settings.SOCIAL_AUTH_AUTH0_KEY + '&' + return_to
    return HttpResponseRedirect(logout_url)

###########    API    ################
#Error thrown in function GetModels, Message: error for getting all models for model ride
#Got this error when trying to load ride list page.
class GetModels(APIView):
	def post(self, request, format=None):
		model_name = request.data.get('modelName', None)
		model_class = model_name_to_class_safe(model_name)
		
		if model_class == None:
			return get_error_406_reponse('No model ' + model_name + ' was found')

		model_filter = request.data.get('modelFilter', dict())
		model_exclude = request.data.get('modelExclude', dict())
		
		try:
			model_set = model_class.objects.all()
			model_set = model_set.filter(**model_filter)
			model_set = model_set.exclude(**model_exclude)
			models = [ serialize_model(model) for model in model_set]
			return get_success_200_reponse(models)
		except Exception as e:
			print(e)
			return get_error_406_reponse('Error getting all models, for model ' + model_name)



class GetModel(APIView):
	def post(self, request, format=None):
		model_name = request.data.get('modelName', None)
		model_class = model_name_to_class_safe(model_name)

		try:
			model_id = int(request.data.get('modelId', None))
		except Exception:
			return get_error_406_reponse('Error parsing modelId')

		if model_class == None:
			return get_error_406_reponse('No model ' + model_name + ' was found')
		
		model_desc = model_name + ',  id: ' + str(model_id) + ' '

		try:
			model = model_class.objects.get(pk=model_id)
		except Exception:
			return get_error_406_reponse('Model ' + model_desc + 'was not found')

		model_json = serialize_model(model)
		return get_success_200_reponse(model_json)

class DeleteModel(APIView):
	def post(self, request, format=None):
		model_name = request.data.get('modelName', None)
		model_class = model_name_to_class_safe(model_name)

		try:
			model_id = int(request.data.get('modelId', None))
		except Exception:
			return get_error_406_reponse('Error parsing modelId')

		if model_class == None:
			return get_error_406_reponse('No model ' + model_name + ' was found')

		model_desc = model_name + ',  id: ' + str(model_id) + ' '

		try:
			model = model_class.objects.get(pk=model_id)
			model.delete()
			return get_success_200_reponse(None)
		except Exception:
			return get_error_406_reponse('Error deleting model ' + model_desc)

class CreateModel(APIView):
	def post(self, request, format=None):
		model_name = request.data.get('modelName', None)
		model_class = model_name_to_class_safe(model_name)

		if model_class == None:
			return get_error_406_reponse('No model ' + model_name + ' was found')

		try:
			#load attributes to set
			attributes = request.data.get('attributes', {})
		except Exception:
			return get_error_406_reponse('Error parsing attributes')
		
		#create model and set attributes
		new_model = model_class()

		try:
			for name, val in attributes.items():
				setattr(new_model, name, val)
		except Exception:
			return get_error_406_reponse('Error setting attributes ')

		new_model.save()
		new_model_json = serialize_model(new_model)
		return get_success_200_reponse(new_model_json)

class UpdateModel(APIView):
	def post(self, request, format=None):
		model_name = request.data.get('modelName', None)
		model_class = model_name_to_class_safe(model_name)

		if model_class == None:
			return get_error_406_reponse('No model ' + model_name + ' was found')

		try:
			model_id = int(request.data.get('modelId', None))
		except Exception:
			pass

		model_desc = model_name + ', id: ' + str(model_id) + ' '

		try:
			#load attributes to set
			attributes = request.data.get('attributes', {})
		except Exception:
			return get_error_406_reponse('Error parsing attributes')

		try:
			#create model and set attributes
			model = model_class.objects.get(pk=model_id)
		except Exception:
			return get_error_406_reponse('No ' + model_desc + ' was found')

		try:
			for name, val in attributes.items():
				setattr(model, name, val)
		except Exception:
			return get_error_406_reponse('Error setting attribute on ' + model_desc)

		model.save()
		model_json = serialize_model(model)
		return get_success_200_reponse(model_json)

class ExecuteModelMethod(APIView):
	def post(self, request, format=None):
		method_params = request.data.get('methodParams', {})
		model_name = request.data.get('modelName', "")
		method_name = request.data.get('methodName', "")

		#execute model method here
		#Note to Jackson
		#	the tricky part here will be converting the string model_name and string method_name into the actual class and method objects we need to call the method
		#   see method model_name_to_class_safe below, and how I used it in the above API methods
		#	you may want to consider making one for methods too- it's not just lazy coding (though it looks like it)
		#		it also has security benefits compared to eval() or reflection (two other ways to achieve the same result you may find on stackoverflow)
		
		model_class = model_name_to_class_safe(model_name)
		method = method_name_to_method_safe(model_class ,method_name)
		result = method(method_params)
		return get_success_200_reponse(str(result))

def get_error_406_reponse(error_text):
	return Response(error_text, status=httpstatus.HTTP_406_NOT_ACCEPTABLE)

def get_success_200_reponse(data):
	return Response(data, status=httpstatus.HTTP_200_OK)

#use switch statement to avoid using hack methods to get class from string
def model_name_to_class_safe(model_name):
	if model_name == 'UserData':
		return models.UserData
	if model_name == 'User_Ride':
		return models.User_Ride
	if model_name == 'Ride':
		return models.Ride
	if model_name == 'Rating':
		return models.Rating
	else:
		return None


#
def method_name_to_method_safe(model_class ,method_name):
	method_to_call = getattr(model_class, method_name)
	return method_to_call


#serialize single model to JSON
def serialize_model(model_instance):
	model_dict = model_to_dict(model_instance)
	# return json.dumps(model_dict)
	dje = DjangoJSONEncoder()
	return dje.encode(model_dict)

def get_user_data(auth0user_obj, request_user_obj):
	true_user_id = User.objects.get(email=auth0user_obj.extra_data['email']).id
	userdata = {
		'user_id': true_user_id,
        'name': request_user_obj.first_name,
        'picture': auth0user_obj.extra_data['picture'],
        'email': auth0user_obj.extra_data['email'],
	}
	return userdata

def concat_page_params(request, params={}):
	user = request.user
	auth0user = user.social_auth.get(provider='auth0')
	user_data = get_user_data(auth0user, user)
	params['userdata'] = user_data
	return params