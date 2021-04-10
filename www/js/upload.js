define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var Upload = {};
	Upload.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	Upload.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .upload_audit": "upload"
		},

		onUploadAudit: function(mId) {
			var that = this;
			
			require(["templates/t_audits_upload"], function(template){
				
				fetchStoreName(db, mId, function(result){
					that.storeName = result.storeName;

					var html = Mustache.to_html(template, {"mId": mId, "name": that.storeName});
	            	that.$el.html(html);
				});
            });
		},

		upload: function(event){
			var that = this;

			//inswit.errorLog({"Info":"Upload Initiated"});

			if(that.$el.find(".upload_audit").hasClass("clicked")){
				//inswit.errorLog({"Clicked": that.$el.find(".upload_audit").hasClass("clicked")});
				return;
			}

			//inswit.errorLog({"Info": "Before 'clicked' class add"});

			that.$el.find(".upload_audit").addClass("clicked");

			//inswit.errorLog({"Info": "After 'clicked' class add"});

			inswit.showLoaderEl("Preparing data... Please wait...");

			var mId = $(event.currentTarget).attr("href");
			
			//inswit.errorLog({"Info": "MID: " + mId});
			
			var id = mId.split("-");
            that.auditId = id[0];
            
            //inswit.errorLog({"Info": "auditId: " + that.auditId});
            
            that.storeId = id[1];
            
            //inswit.errorLog({"Info": "StoreId: " + that.storeId});
            
            that.channelId = id[2];
            
            //inswit.errorLog({"Info": "channelId: " + that.channelId});
            
            that.retry = 0;

			selectCompletedAudit(db, mId, function(audit){
				//inswit.errorLog({"error":"After fetching completed audit", "audit":audit, "AuditLength": audit.length});

				if(audit.length > 0){
					
					var storeImage = audit.item(0).store_image;

					//inswit.errorLog({"Info":"StoreImage", "image":storeImage});

					var signImage = audit.item(0).sign_image;

					//inswit.errorLog({"Info":"SignImage", "image":signImage});

					var storeImageId = audit.item(0).store_image_id;

					//inswit.errorLog({"Info":"StoreImageId", "image":storeImageId});

					var signImageId = audit.item(0).sign_image_id;

					//inswit.errorLog({"Info":"SignImageId", "image":signImageId});

					//inswit.errorLog({"error":"audit fetched", "audit":audit});

					var imageList = [];
					imageList.push({
						"auditId":that.auditId,
						"storeId":that.storeId,
						"productId":"storeImage",
						"productName":"Store",
						"imageURI":storeImage,
						"image":storeImageId
					});

					var completed = audit.item(0).comp_audit;

					//inswit.errorLog({"info":"Audit is completed or not?", "isCompleted":completed});

					var audited = audit.item(0).audited;

					//inswit.errorLog({"info":"Audit is audited or not?", "Audited":audited});

					if(completed == "true" && audited == "true"){
						imageList.push({
							"auditId":that.auditId,
							"storeId":that.storeId,
							"productId":"signImage",
							"productName":"Sign",
							"imageURI":signImage,
							"image":signImageId,
						});

						selectAllCompProducts(db, that.auditId, that.storeId, function(products){
							//inswit.errorLog({"error":"all products fetched", "allproducts":products});

							that.products = products;
							//Get unique product, image list
							selectCompProducts(db, that.auditId, that.storeId, function(productList){
								//inswit.errorLog({"error":"completed products fetched", "completed_products":productList});

								for(var i = 0; i < productList.length; i++){
									var p = productList[i];
									/**
									 * Priority 8 means hotspot brands
									 * Hotspot brands should not have images thats why i restricted based on priority
									 * Sometimes hotspot and Frontage brand also doesn't had image, thats why i am checking image_uri
									 */
									if(p.priority != 8 && p.image){
										imageList.push({
											"auditId":that.auditId,
											"storeId":that.storeId,
											"productId":p.product_id,
											"productName":p.product_name,
											"imageURI":p.image,
											"image":p.image_id,
											"normId": p.norm_id
										});
									}
								}

								that.$(".upload_container").hide();
								that.uploadPhoto(imageList, 0, imageList.length);
							});
						});
					}else{
						//inswit.errorLog({"Info": "Complted but not audited"});
						that.uploadPhoto(imageList, 0, imageList.length);
					}
                }else{
                	//inswit.errorLog({"error":"audit might be empty", "audit":audit});
                	inswit.hideLoaderEl();
                	that.$el.find(".upload_audit").removeClass("clicked");
                	
                }
			}, function(a, e){
				//inswit.errorLog({"Info":"Database error", "error":e});
				inswit.hideLoaderEl();
				that.$el.find(".upload_audit").removeClass("clicked");
			});
		},

		//Upload images one by one to the Alfresco Server
		uploadPhoto: function(imageList, index, length, isRetry){
			var that = this;

			//inswit.alert("image upload initiated");
			//inswit.errorLog({"Info":"uploading" + index + " image" , "imageDetails":imageList[index]});
			var success = checkConnection();
		   	if(!success) {

		   		//inswit.errorLog({"Info":"No Internet connection While uploading photo"});

		   		inswit.alert("No Internet Connection!", "Alert");
		   		inswit.hideLoaderEl();
		   		that.$el.find(".upload_audit").removeClass("clicked");
		   		return;
		   	}

			//Call upload audit function once all images are uploaded successfully
			if(length == 0){
				//inswit.alert("uploading audit");
				that.uploadAudit(imageList);
				that.$el.find(".upload_audit").removeClass("clicked");
				return;
			}

			//Retry happen twice per image
			if(isRetry){
				that.retry = that.retry + 1;
				if(that.retry >= 2){
					//inswit.errorLog({"error":"image upload failure","imageList":imageList[index]});
					inswit.hideLoaderEl();
					inswit.alert("Image upload failed! Try again later!");
					that.imageUploadFailure(imageList, index);
					that.$el.find(".upload_audit").removeClass("clicked");
					return;
				}
			}else{
				that.retry = 0;
			}

			//IF ImageURI is undefined just skip that image and going to next.
			var imageURI = imageList[index].imageURI;
			if(!imageURI || imageURI == "undefined"){
				that.uploadPhoto(imageList, index+1, length-1);
				return;
			}

			//IF imageId is there means is already uploaded,
			var imageId = imageList[index].image;
			if(imageId){
				that.uploadPhoto(imageList, index+1, length-1);
				return;
			}

			var date = new Date().toJSON();

			var fileName;

			var normId = imageList[index].normId;

			if(normId) {
			    fileName = LocalStorage.getEmployeeId() + "_" + imageList[index].auditId + "_" + imageList[index].storeId + "_"+ imageList[index].productId + "_" + imageList[index].normId  + "_"  + date.replace(/([.:])/g, "-");
			}else {
			    fileName = LocalStorage.getEmployeeId() + "_" + imageList[index].auditId + "_" + imageList[index].storeId + "_"+ imageList[index].productId + "_" + date.replace(/([.:])/g, "-");
			}


			var options = new FileUploadOptions();
		    options.fileKey = "file"; //depends on the api
		    options.fileName = fileName + ".jpg";
		    options.mimeType = "image/jpeg";
		    options.headers = {"X-Requested-With":"XMLHttpRequest"};
		    options.fileName.replace("." , ":");

		    //Success fallback function for image upload
		    inswit.showLoaderEl("Uploading " + imageList[index].productName + " picture");
		    var onSuccess = function(response){
		    	var result = JSON.parse(response.response);
		    	if(response.responseCode == 200 && result.ok){

		    		var auditId = imageList[index].auditId;
		    		var storeId = imageList[index].storeId;
		    		var productId = imageList[index].productId;

					if(!result.info.id){
						//Retry the same image
						that.uploadPhoto(imageList, index, length, true);
						return;
					}
					var image = result.info.id;
					imageList[index].image = image;

					console.log(image);

					if(productId == "storeImage"){
						updateStoreImageId(db, auditId, storeId, image, function(){
							that.uploadPhoto(imageList, index+1, length-1);
							return;
							
						}, function(a, e){
							that.uploadPhoto(imageList, index, length);
							return;

						});
					}else if(productId == "signImage"){
						updateSignImageId(db, auditId, storeId, image, function(){

							that.uploadPhoto(imageList, index+1, length-1);
							return;
						
						}, function(a, e){
							that.uploadPhoto(imageList, index, length);
							return;

						});
					}else{
						updateProductImageId(db, auditId, storeId, productId, image, normId, function(){

							that.uploadPhoto(imageList, index+1, length-1);
							return;

						}, function(a, e){
							that.uploadPhoto(imageList, index, length);
							return;
						});
					}
		    	}else{
		    		that.uploadPhoto(imageList, index, length, true);
		    	}
		    }

		    //Failure fallback function for image upload
		    var onFail = function(e){
		    	/**
		    	 * If file is not found in STORAGE
		    	 * Mark as not found and SKIP that file
		    	 * else
		    	 * Retry the same file to upload once again
		    	 */ 
		    	
		    	if(e.code == FileTransferError.FILE_NOT_FOUND_ERR) {
		    		console.log("Image not found!");
		    		that.imageUploadFailure(imageList, index, e);
	
					//This is not retry, skip current image and start upload next
					that.uploadPhoto(imageList, index+1, length-1);
					return;

		    	}else{ 

		    		if(that.retry < 2){
			    		//Retry the same image
			    		that.uploadPhoto(imageList, index, length, true);
			    		return;
			    	}else{
			    		//inswit.errorLog({"Info":"Image upload failed. Code stopped here", "imageDeatils":imageList[index]});
			    		inswit.hideLoaderEl();
			    		that.$(".upload_container").show();
			    		inswit.alert("Image upload failed! Try again later!");
			    		that.$el.find(".upload_audit").removeClass("clicked");
			    		return;
			    	}
		    	}
		    }

		    //Upload a image using File Transfer plugin
		    var ft = new FileTransfer();
    		ft.upload(
    			imageURI,
    			encodeURI(inswit.URI + "ProcessStore/d/drive/upload"),
    			onSuccess,
    			onFail,
    			options
    		);
		},

		imageUploadFailure: function(imageList, index, error) {
			this.$(".upload_container").show();
			inswit.hideLoaderEl();

			if(error){
				imageList[index].error = error;
			}
			var pVariables = {
			    "projectId":inswit.ERROR_LOG.projectId,
			    "workflowId":inswit.ERROR_LOG.workflowId,
			    "processId":inswit.ERROR_LOG.processId,
			    "ProcessVariables":{
			    	"errorType": inswit.ERROR_LOG_TYPES.IMAGE_UPLOAD,
			    	"auditId": imageList[index].auditId, 
			    	"storeId": imageList[index].storeId,
			    	"empId":LocalStorage.getEmployeeId(),
			    	"issueDate":new Date(),
			    	"issueDescription": JSON.stringify(imageList[index]),
			    	"version": inswit.VERSION
			    }
			};

			inswit.executeProcess(pVariables, {
			    success: function(response){
			    	if(response.ProcessVariables){
			    		
			    	}
                }, failure: function(error){
                	inswit.hideLoaderEl();
                	switch(error){
                		case 0:{
                			inswit.alert("No Internet Connection!");
                			break;
                		}
                		case 1:{
                			inswit.alert("Check your network settings!");
                			break;
                		}
                		case 2:{
                			inswit.alert("Server Busy.Try Again!");
                			break;
                		}
                	}
                }
            });
		},

		uploadAudit: function(imageList) {
			var that = this;
			
			//inswit.errorLog({"error":"uploading audit details"});

			var success = checkConnection();
		   	if(!success) {
		   		//inswit.errorLog({"error":"No Internet connection while uploading Audit details"});
		   		inswit.hideLoaderEl();
		   		inswit.alert("No Internet Connection!", "Alert");
		   		return;
		   	}

		   	selectAllCompProducts(db, that.auditId, that.storeId, function(products){

		   		//inswit.errorLog({"error":"all completed products fetched Before uploading audits", "allCompletedproducts":products});
		   		var auditDetails = [];
				var length = 0;
				if(products){
					length = products.length;
				}
				
				for(var j = 0; j < length; j++){
					var product  = products[j];
					var productId = product.product_id;
					var normId = product.norm_id;
					var executionStatus = (product.non_execution == "true") ? true:false;

					var photoId = "";
					if(product.image_id){
						photoId = inswit.URI + "d/drive/docs/" + product.image_id;
					}
					
					var detail = {
						brandId:productId,
						normId:normId,
						photoId:photoId,
						nonExecution: executionStatus
					}

					auditDetails.push(detail);
				}

				var date = new Date();
		        date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

				var storeImage = "";
				if(imageList[0] && imageList[0].image){
					storeImage = inswit.URI + "d/drive/docs/" + imageList[0].image;
				}

				var signImage = "";
				if(imageList[1] && imageList[1].image){
					signImage = inswit.URI + "d/drive/docs/" + imageList[1].image;
				}
				
				findStore(db, that.auditId, that.storeId, function(result){

					//inswit.errorLog({"Info":"Store Deatils fetched", "store": result});

			   		var lat = result.lat;
			   		var lng = result.lng;

			   		var updateStorePosition = false;
			   		if(lat == "" || lng == ""){
			   			updateStorePosition = true;
			   		}

			   		//Query audit details from the database
			   		var mId = that.auditId + "-" + that.storeId + "-" + that.channelId;
			   		selectCompletedAudit(db, mId, function(audit){

			   			//inswit.errorLog({"error":"After fetching completed audit while uploading audit", "audit":audit, "AuditLength": audit.length});
						if(audit.length > 0){
							var auditStatus = audit.item(0).option_id;		
							var id = audit.item(0).id;
							var latitude = audit.item(0).lat;
							var longitude = audit.item(0).lng;

							var processVariables = {
								"projectId":inswit.UPLOAD_PROCESS.projectId,
								"workflowId":inswit.UPLOAD_PROCESS.workflowId,
								"processId":inswit.UPLOAD_PROCESS.processId,
								"ProcessVariables":{
									"auditDetails":auditDetails,
									"auditId":that.auditId,
									"id":id,
									"auditor":LocalStorage.getEmployeeId(),
									"storeId":that.storeId,
									"date": date,
									"option": auditStatus,
									"latitude": latitude,
									"longitude": longitude,
									"storeImage":storeImage,
									"signImage":signImage,
									"updateStorePosition": updateStorePosition,
									"version":inswit.VERSION
								}
							};

							//inswit.errorLog({"info":"After constructing processvariables", "processVariables":processVariables});

							//Upload the Audit details to the Appiyo server
							inswit.executeProcess(processVariables, {
								success: function(response){
									if(response.Error == "0"){
										//inswit.errorLog({"info":"After Successfull upload of audit"});
										if(response.ProcessVariables.status == "10"){
											inswit.alert(response.ProcessVariables.message);
											
											router.navigate("/audits", {
						                        trigger: true
						                    });
											return;
										}

										inswit.clearPhoto(imageList);

										var template = "<div class='success_container'>\
												<img src='images/matrix_icons/success_48.png' align='middle'>\
												<p class='alert_msg'>Audit details for <br/><b>{{name}}</b><br/>has been updated successfully</p>\
												<a class='go_audit_list btn btn-success' href='#audits'>Go to Audit List</button>\
											</div>";

										var html = Mustache.to_html(template, {"name":that.storeName});
										inswit.hideLoaderEl();
										that.$el.empty().append(html);

										var auditDetails = {
                                            "auditId": that.auditId,
                                            "storeId": that.storeId,
                                            "date": new Date(),
                                        }
                                        populateAuditHistoryTable(db, auditDetails);

                                        removeAuditEntries(db, that.auditId, that.storeId);
									}else{
										//inswit.errorLog({"info":"Audit upload failed"});

										if(response.ProcessVariables.status == "10"){
											inswit.alert(response.ProcessVariables.message);
										}else{
											inswit.alert("Server Error. Try Again Later!", "Error");
										}

										var pVariables = {
										    "projectId":inswit.ERROR_LOG.projectId,
										    "workflowId":inswit.ERROR_LOG.workflowId,
										    "processId":inswit.ERROR_LOG.processId,
										    "ProcessVariables":{
										    	"errorType": inswit.ERROR_LOG_TYPES.UPLOAD_AUDIT,
										    	"auditId": that.auditId, 
										    	"storeId": that.storeId,
										    	"empId":LocalStorage.getEmployeeId(),
										    	"issueDate":new Date(),
										    	"issueDescription": JSON.stringify(processVariables.ProcessVariables),
										    	"version": inswit.VERSION
										    }
										};
						
										inswit.executeProcess(pVariables, {
										    success: function(response){
										    	inswit.hideLoaderEl();
										    	if(response.ProcessVariables){
										    		
										    	}
							                }, failure: function(error){
							                	inswit.hideLoaderEl();
							                	switch(error){
							                		case 0:{
							                			inswit.alert("No Internet Connection!");
							                			break;
							                		}
							                		case 1:{
							                			inswit.alert("Check your network settings!");
							                			break;
							                		}
							                		case 2:{
							                			inswit.alert("Server Busy.Try Again!");
							                			break;
							                		}
							                	}
							                }
							            });
									}
								}, failure: function(error){
									//inswit.errorLog({"info":"Audit upload failed with server problem", "error": error});
									inswit.hideLoaderEl();
									switch(error){
				                		case 0:{
				                			inswit.alert("No Internet Connection!");
				                			break;
				                		}
				                		case 1:{
				                			inswit.alert("Check your network settings!");
				                			break;
				                		}
				                		case 2:{
				                			inswit.alert("Server Error. Try Again Later!", "Error");
				                			break;
				                		}
				                	}
								}
							});
						}
					});
			   	});
		   	});
		}
	});
	
	return Upload;
});