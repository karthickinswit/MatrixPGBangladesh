define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var AuditDetails = {};
	AuditDetails.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	AuditDetails.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .back": "back"
		},

		showAuditDetails: function(mId){
			var that = this;

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];
			try{
				inswit.showLoaderEl("Fetching Audit Details");
				require(['templates/t_audit_details'], function(template){
					try{
						findStore(db, auditId, storeId, function(result){
							inswit.hideLoaderEl();
							var date = new Date();
			            	var formattedDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
			            	
			            	that.auditDetails = {
								name: result.store_name,
								storeId: result.store_id,
								id: result.id,
								storeCode: result.store_code,
								auditId: result.audit_id,
								distName: result.dbtr_name,
								location: result.loc_name,
								channelId: result.chl_id,
								channelName: result.chl_name,
								marketId: result.mkt_id,
								branchName: result.brch_name,
								address: result.addr,
								auditorName: result.adtr_name,
								auditorCode: result.adtr_code,
								date: formattedDate,
								mId:mId
							};
				 
							var html = Mustache.to_html(template, that.auditDetails);
							that.$el.empty().append(html);

							if(!window.reload){
								window.url = "async!http://maps.google.com/maps/api/js?sensor=false";
							}
							
							require([url], function(){
								
								var success = checkConnection();
							   	if(success && window.google) {
								   	/*
									* 1.Second time onwards there is a latitude and longitude.
									* 2.Creating map and marker based on that co-ordinates.
									*/
									
									if(result.lat != "" || result.lng != ""){
										var myLatLng = new google.maps.LatLng(result.lat, result.lng);
										var myOptions = {
											zoom: 16,
											center: myLatLng,
											mapTypeId: google.maps.MapTypeId.ROADMAP
									    };

									    var element = document.getElementById("map");
									    var map = new google.maps.Map(element, myOptions);

									    var marker = new google.maps.Marker({
									    	position: myLatLng,
									    	map: map,
									    	animation: google.maps.Animation.BOUNCE,
									    	title: result.store_name
									  	});

									}else{
										/*
										* 1.First time there is no latitude and longitude.
										* 2.I am using Geocoder service to get the latitude and longitude of the store address
										*   and creating marker based on that co-ordinates.
										*/
										
										var geocoder = new google.maps.Geocoder();
										geocoder.geocode({"address": result.addr}, function(results, status) {
										 	// If the Geocoding was successful
											if(status == google.maps.GeocoderStatus.OK) {
											    // Create a Google Map at the latitude/longitude returned by the Geocoder.
											    that.renderMap(results[0].geometry.location, result.store_name);
												
											}else{
												/*
												* 1.If store address is invalid, I am just showing auditor current position
												*/
												var isCalled = false;
												var callback = function(pos){
													isCalled = true;
													if(pos != ""){
														that.renderMap(pos ,result.store_name);
													}else{
														$(".map_error_info").text("There was an error loading location map! Network error/ Lat-Long not available");
													}
												};

												var options = {
											    	maximumAge:inswit.MAXIMUM_AGE,
		    										timeout:inswit.TIMEOUT,
											    	enableHighAccuracy:true
												};
												inswit.getLatLng(callback, options, false);

												if(that.tmr){
													clearTimeout(timer);
													timer = null;
												}

												that.tmr = setTimeout(function(){
													if(!isCalled){
														$(".map_error_info").text("There was an error loading location map! Network error/ Lat-Long not available");
													}
												}, 10000);
										  	}
										});
									}
							   	}else{

							   		window.reload = true;
							   		var timestamp = new Date().getTime();
									window.url = "async!http://maps.google.com/maps/api/js?sensor=false&t="+timestamp;

							   		$(".map_error_info").text("There was an error loading location map! Network error/Lat-Long not available");
							   	}
							}, function(){

								window.reload = true;
								var timestamp = new Date().getTime();
								window.url = "async!http://maps.google.com/maps/api/js?sensor=false&t="+timestamp;
								
								$(".map_error_info").text("There was an error loading location map! Network error/Lat-Long not available");
							});

							that.refreshScroll("wrapper_audit_details");
						
							return that;

						}, function(error, w){
							var error = "Fetch Error: " + error;

							inswit.alert(error);
							inswit.alert(w);

						});
					}catch(e){
						var error = "Database Error: " + e;
						inswit.alert(error);
					}
				});
			}catch(e){
				var error = "Loading Error: " + e;
				inswit.alert(error);
			}
		},

		renderMap: function(pos, storeName){
			// Create a Google Map at the latitude/longitude returned by the Geocoder.
		    var myOptions = {
				zoom: 16,
				center: pos,
				mapTypeId: google.maps.MapTypeId.ROADMAP
		    };

		    var element = document.getElementById("map");
		    var map = new google.maps.Map(element, myOptions);

		    var marker = new google.maps.Marker({
		    	position: pos,
		    	map: map,
		    	animation: google.maps.Animation.BOUNCE,
		    	title: storeName
		  	});
		},

		back: function(){
			window.history.back();
		},

		refreshScroll: function(wrapperEle) {
			if(!this.scrollView) {
				this.scrollView = new iScroll(wrapperEle);
			}
			this.scrollView.refresh();
		}

	});

	return AuditDetails;
});