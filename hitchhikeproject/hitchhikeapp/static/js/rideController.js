var rideController = (function (){
    async function getRideList(rideParams) {
        return await getModels('Ride', rideParams);
    }

    async function advanceRideStatus(rideId) {
        //not yet used
    }

    async function createRide(rideData, createdByUserId) {
        var r = await createModel('Ride', rideData); 
            
        //now create association between user and ride
        var u_r = await createModel('User_Ride', {
            rideId: r.id
            , userId: createdByUserId
            , userRole: userRole.Driver
        });
    }


    return {
        getRideList: getRideList
        , advanceRideStatus: advanceRideStatus
        , createRide:createRide
    }
})();