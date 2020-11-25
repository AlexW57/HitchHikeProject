from django.db import models
from django.db import connection
from rest_framework import serializers
from hitchhikeapp import views
from django.core.serializers.json import DjangoJSONEncoder

rideStatus = {
    'Upcoming': 10
    , 'Completed': 20
}

userRole = {
    'Driver': 10
    , 'Rider' : 20
}

        
# Create your models here.
class UserData(models.Model):
    userId = models.IntegerField(null=True)
    userName = models.CharField(max_length=250, null=True)

    @staticmethod
    def getRating(params={}):
        user_id = int(params.get('UserId', None))

        rating_class = views.model_name_to_class_safe('Rating')

        rating_qs = rating_class.objects.all()
        rating_set = rating_qs.filter(ratingForUserId=user_id)

        total = 0
        rating_len = 0
        for rating_obj in rating_set:
            rating_len += 1
            total += rating_obj.rating

        return total / float(rating_len) if rating_len != 0 else 'null'

    @staticmethod
    def getUserRides(params={
        'UserId': None
        , 'UserRole': None
        , 'Status': None
    }):
        find_user_id = int(params.get('UserId', 0))
        user_role = int(params.get('UserRole', 0))
        status = int(params.get('Status', 0))
        if find_user_id == 0:
            return get_error_406_reponse('getUserRides missing parameter UserId')

        cursor = connection.cursor()
        cursor.execute('''
            select 
                r."id" rideId
                , r."startZip" startZip
                , r."endZip" endZip
                , r."startDate" startDate
                , ur."userRole" userRole
                , r."status" status
            from hitchhikeapp_user_ride ur
            left join hitchhikeapp_ride r
               on ur."rideId" = r."id"
            where ur."userId" = {}
               and {}
               and {}
        '''.format(find_user_id, ' 1=1' if user_role == 0 else ' ur."userRole"=' + str(user_role) + ' ', ' 1=1' if status == 0 else ' r."status"=' + str(status) + ' '))
        result = cursor.fetchall()

        def result_row_to_dict(row):
            return {
                'rideId': row[0]
                , 'startZip': row[1]
                , 'endZip': row[2]
                , 'startDate': row[3]
                , 'userRole': row[4]
                , 'status': row[5]
            }
        
        result = list(map(result_row_to_dict, result))
        
        dje = DjangoJSONEncoder()
        return dje.encode(result)

    @staticmethod
    def getRideRole(params={
        'UserId': None
        , 'RideId': None
    }):
        user_id = int(params.get('UserId', 0))
        ride_id = int(params.get('RideId', 0))
        if user_id == 0:
            return get_error_406_reponse('getRideRole missing parameter UserId')
        if ride_id == 0:
            return get_error_406_reponse('getRideRole missing parameter RideId')

        user_ride_class = views.model_name_to_class_safe('User_Ride')
        result = 'null'
        try:
            user_ride = user_ride_class.objects.get(userId=user_id, rideId=ride_id)
            result = user_ride.userRole
        except Exception:
            pass
        
        return result

class User_Ride(models.Model):
    userId = models.IntegerField(null=True)
    rideId = models.IntegerField(null=True)
    #role determines whether or not user is a rider or driver
    userRole = models.IntegerField(null=True)

class Rating(models.Model):
    rating = models.IntegerField(null=True)
    #associations to user
    ratingForUserId = models.IntegerField(null=True)
    ratingByUserId = models.IntegerField(null=True)

class Ride(models.Model):
    startZip = models.CharField(max_length=15, null=True)
    endZip = models.CharField(max_length=15, null=True)
    startDate = models.DateField(null=True)
    endDate = models.DateField(null=True)
    status = models.IntegerField(null=True)
    vehicleYear = models.CharField(max_length=4, null=True)
    vehicleMake = models.CharField(max_length=100, null=True)
    vehicleModel = models.CharField(max_length=100, null=True)

    @staticmethod
    def getRideList(params={
        'Status': None
    }):
        status = int(params.get('Status', 0))

        cursor = connection.cursor()
        cursor.execute('''
            select 
                r."id" id
                , r."startZip" startZip
                , r."endZip" endZip
                , r."startDate" startDate
                , r."status" status
                , r."vehicleYear" vehicleYear
                , r."vehicleMake" vehicleMake
                , r."vehicleModel" vehicleModel
                , ud_d."userName" driverName
                , (
                    select
                        count(*) Count
                    from hitchhikeapp_user_ride ur_r
                    left join hitchhikeapp_userdata ud_r
                        on ud_r."userId" = ur_r."userId"
                    where ur_r."rideId" = r."id"
                    and ur_r."userRole" = {}
                ) as riderCount
            from hitchhikeapp_ride r
            left join hitchhikeapp_user_ride ur_d
                on ur_d."rideId" = r."id"
                and ur_d."userRole" = {}
            left join hitchhikeapp_userdata ud_d
                on ud_d."userId" = ur_d."userId"
            where 1=1
                and {}
        '''.format(userRole['Rider'], userRole['Driver'], ' 1=1' if status == 0 else ' r."status"=' + str(status) + ' '))
        result = cursor.fetchall()

        def result_row_to_dict(row):
            return {
                'id': row[0]
                , 'startZip': row[1]
                , 'endZip': row[2]
                , 'startDate': row[3]
                , 'status': row[4]
                , 'vehicleYear': row[5]
                , 'vehicleMake': row[6]
                , 'vehicleModel': row[7]
                , 'driverName': row[8]
                , 'riderCount': row[9]
            }
        
        result = list(map(result_row_to_dict, result))
        
        dje = DjangoJSONEncoder()
        return dje.encode(result)

    @staticmethod
    def getRiders(params={
        'RideId': None
    }):
        ride_id = int(params.get('RideId', 0))
        if ride_id == 0:
            return get_error_406_reponse('getRideRole missing parameter RideId')

        cursor = connection.cursor()
        cursor.execute('''
            select 
                ud."userName" userName
                , ud."userId" userId
            from hitchhikeapp_user_ride ur
            left join hitchhikeapp_userdata ud
               on ud."userId" = ur."userId"
            where ur."rideId" = {}
            and ur."userRole" = {}
        '''.format(ride_id, userRole['Rider']))
        result = cursor.fetchall()

        def result_row_to_dict(row):
            return {
                'userName': row[0]
                , 'userId': row[1]
            }
        
        result = list(map(result_row_to_dict, result))
        
        dje = DjangoJSONEncoder()
        return dje.encode(result)

    @staticmethod
    def getDriverId(params={
        'RideId': None
    }):
        ride_id = int(params.get('RideId', 0))
        if ride_id == 0:
            return get_error_406_reponse('getRideRole missing parameter RideId')

        user_ride_class = views.model_name_to_class_safe('User_Ride')
        result = 'null'
        try:
            user_ride = user_ride_class.objects.get(rideId=ride_id, userRole=userRole['Driver'])
            result = user_ride.userId
        except Exception:
            pass
        
        return result