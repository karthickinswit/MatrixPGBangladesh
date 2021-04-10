define([
	"backbone", 
	"mustache",
	"templates/t_audits",
	"select2"
], function(Backbone, Mustache, template) {
	var UploadAll = {};
	UploadAll.Model = Backbone.Model.extend({
		defaults:{
		},

		initialize: function() {}                             
	});

	UploadAll.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .back": "back",
			//"click .audit": "showAudit",
			"click #upload_all":"uploadAll",
			"click .bulk_upload_retry": "retryBulkUpload"
		},

		initialize: function() {
		    this.retryCount = 0;
		},

		render: function(){
			var that = this;
            this.retryCount = 0;
            this.errorStack = [];
            this.checkError = false
            this.alert = true;
			require(['templates/t_audits'], function(template){
				selectAllCompAuditWithJoin(db, function(audits){
					if(audits.length > 0){
						inswit.setColorCode(audits, function(audits){
							
							that.readyToUploadAudits = audits;
            				that.readyToUploadCount = audits.length;

							var html = Mustache.to_html(template.compAudit, {"total": that.readyToUploadCount, "audits":audits});
							that.$el.empty().html(html);

							that.refreshScroll("upload_audit_wrapper");
						});						
					}else{
						that.$el.empty().html(template.emptyCompAudit);
					}
				});
			});
		},

		back: function(){

			var hash = location.hash;
		    var temp = hash.split("/");

		    var length = temp.length;
		    if(length > 0)
		        temp = temp[length - 1];
		    else
		        temp = "";

			if(hash == "" || hash == "#audits") {
		        inswit.confirm("Are you sure want to quit?", 
		            function(index) {
		                if(index == 1) {
		                    navigator.app.exitApp();
		                }
		        }, "Quit", ["Ok", "Cancel"]);

		        return false;
		    }else if(temp === "upload" || temp === "all"){

		        router.navigate("/audits", {
		            trigger: true
		        });
		    }else{
		        window.history.back();
		    }
		},

		refreshScroll: function(wrapperEle) {
			if(!this.scrollView) {
				this.scrollView = new iScroll(wrapperEle);
			}
			this.scrollView.refresh();
		},

		showAudit: function(event){
			var that = this;

			var mId = $(event.currentTarget).attr("href");

            selectCompletedAudit(db, mId, function(audit){
            	that.readyToUpload = audit;

            	if(audit.length > 0){
            		audit = audit.item(0);

	            	if((audit.audited == "true" && audit.comp_audit == "false") 
						|| (audit.audited == "false" && audit.comp_audit == "false")
						|| (audit.audited == "true" && audit.comp_audit == "true") 
						|| (audit.audited == "false" && audit.comp_audit == "true")){

						router.navigate("/audits/"+ mId + "/continue", {
	                        trigger: true
	                    });
					}
            	}else{
            		router.navigate("/audits/"+ mId, {
                        trigger: true
                    });
            	}
            });
		},

		uploadAll: function(){
			var that = this;

			if(that.$el.find(".upload_all").hasClass("clicked")){
				return;
			}

			that.$el.find(".upload_all").addClass("clicked");

			that.upload(that.readyToUploadAudits, 0, that.readyToUploadAudits.length);

		},

		retryBulkUpload: function(){
		    this.render();
			//location.reload();
			/*router.navigate("/audits/upload/all", {
                trigger: true,
                replace: true
            });*/
		},

		upload: function(readyToUpload, currentAuditIndex, auditLength){
			var that = this;
			var errorCaused;
			var auditFailId = []

			if(auditLength == 0){

				var total = readyToUpload.length;
				var uploaded = 0, failed  = 0;

				for(var i = 0; i < total; i++){
					var auditStatus = readyToUpload[i].isUploaded;
					if(auditStatus == true){
						uploaded += 1;
					}else{
						failed += 1;
						auditFailId.push(readyToUpload[i].id);
						that.updateErrorFailureLog(auditFailId);
					}
				}

				if(failed == 0){
				    inswit.hideLoaderEl();
					var template = "<div class='success_container'>\
									<img src='images/matrix_icons/success_48.png' align='middle'>\
									<p class='summary_msg_header'>All store photos uploaded successfully</p>\
									<p class='summary_msg'>Total Stores: {{total}}</p>\
									<p class='summary_msg'>Uploaded: {{uploaded}}</p>\
									<p class='summary_msg'>Failed: {{failed}}</p>\
									<a class='go_audit_list btn btn-success' href='#audits'>Go to Store List</button>\
								</div>";
				}else{
					var template = "<div class='success_container'>\
									<img src='images/matrix_icons/waiting_48.png' align='middle'>\
									<p class='summary_msg_header'>{{failureMsg}}</p>\
									<p class='summary_msg_header'>{{msg}}</p>\
									<p class='summary_msg'>Total Stores: {{total}}</p>\
									<p class='summary_msg'>Uploaded: {{uploaded}}</p>\
									<p class='summary_msg'>Failed: {{failed}}</p>\
									<p class='summary_msg'>Error caused: {{errorCaused}}</p>\
									<a class='bulk_upload_retry btn btn-warning'>Retry</button>\
									<a class='go_audit_list btn btn-success' href='#audits'>Go to Store List</button>\
								</div>";

					if(that.errorStack.length > 0) {
                        errorCaused = that.errorStack.join(", ");
                    }

					if(that.retryCount < inswit.uploadRetryLimit) {
					    that.retryCount = that.retryCount + 1;
					    if(that.retryCount == 5) {
					        that.checkError = true;
					    }
					    that.upload(that.readyToUploadAudits, 0, that.readyToUploadAudits.length);
					    return;
					}else {
					    inswit.hideLoaderEl();
					}

				}
                that.$el.find(".upload_container").detach();
				var html = Mustache.to_html(template, {"total":total, "uploaded":uploaded, "failed": failed,
				"failureMsg": inswit.ErrorMessages.UploadAllFail, "errorCaused": errorCaused});
				that.$el.empty().append(html);

				return;
			}

			readyToUpload[currentAuditIndex].isUploaded = false;
			var storeName = readyToUpload[currentAuditIndex].store_name;

			that.message = "Uploading " + storeName + " (" + (currentAuditIndex + 1) + " / " + that.readyToUploadCount + ") ";
			if(that.retryCount == 0) {
			    inswit.showLoaderEl(that.message);
			}else {
			    inswit.showLoaderEl("Retry count: "+ that.retryCount +"   "+that.message);
			}


			//var mId = $(event.currentTarget).attr("href");
			
			var mId = readyToUpload[currentAuditIndex].mId;

			var id = mId.split("-");
            that.auditId = id[0];
            that.storeId = id[1];
            that.channelId = id[2];
           
            that.retry = 0;

			selectCompletedAudit(db, mId, function(audit){
			
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
					var audited = audit.item(0).audited;

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
							
							that.products = products;
							//Get unique product, image list
							selectCompProducts(db, that.auditId, that.storeId, function(productList){
							
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

								//that.$(".upload_container").hide();
								that.uploadPhoto(
									imageList, 
									0, 
									imageList.length, 
									false, 
									readyToUpload, 
									currentAuditIndex, 
									auditLength);
							});
						});
					}else{
						that.uploadPhoto(
							imageList, 
							0, 
							imageList.length, 
							false, 
							readyToUpload, 
							currentAuditIndex, 
							auditLength
						);
					}
                }else{
                	that.upload(
                		readyToUpload, 
                		currentAuditIndex + 1, 
                		auditLength - 1);
                }
			}, function(a, e){
				that.upload(
            		readyToUpload, 
            		currentAuditIndex + 1, 
            		auditLength - 1);

				// inswit.hideLoaderEl();
				// that.$el.find(".upload_all").removeClass("clicked");
			});
		},

		//Upload images one by one to the Alfresco Server
		uploadPhoto: function(
			imageList, 
			index, 
			length, 
			isRetry, 
			readyToUpload, 
			currentAuditIndex,
			auditLength
		){

			var that = this;

			var success = checkConnection();
		   	if(!success) {

		   		inswit.alert("No Internet Connection!", "Alert");
		   		inswit.hideLoaderEl();
		   		that.$el.find(".upload_all").removeClass("clicked");
		   		return;
		   	}

			//Call upload audit function once all images are uploaded successfully
			if(length == 0){
				that.uploadAudit(
					imageList, 
					readyToUpload, 
					currentAuditIndex,
					auditLength);

				//that.$el.find(".upload_all").removeClass("clicked");
				return;
			}

			//Retry happen twice per image
			if(isRetry){
				that.retry = that.retry + 1;
				if(that.retry >= 2){
					//inswit.hideLoaderEl();
					//inswit.alert("Image upload failed! Try again later!");
					that.upload(
						readyToUpload, 
						currentAuditIndex+1,
						auditLength-1
					);
					that.imageUploadFailure(imageList, index);
					//that.$el.find(".upload_all").removeClass("clicked");
					return;
				}
			}else{
				that.retry = 0;
			}

			//IF ImageURI is undefined just skip that image and going to next.
			var imageURI = imageList[index].imageURI;
			if(!imageURI || imageURI == "undefined"){
				that.uploadPhoto(
					imageList, 
					index+1, 
					length-1, 
					false,
					readyToUpload, 
					currentAuditIndex,
					auditLength);
				return;
			}

			//IF imageId is there means is already uploaded,
			var imageId = imageList[index].image;
			if(imageId){
				that.uploadPhoto(
					imageList, 
					index+1, 
					length-1, 
					false,
					readyToUpload, 
					currentAuditIndex,
					auditLength);
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
		    
		   // inswit.showLoaderEl(that.message + " \r\n " + imageList[index].productName + " picture");

		    var onSuccess = function(response){
		    	var result = JSON.parse(response.response);
		    	if(response.responseCode == 200 && result.ok){

		    		var auditId = imageList[index].auditId;
		    		var storeId = imageList[index].storeId;
		    		var productId = imageList[index].productId;

					if(!result.info.id){
						//Retry the same image

						that.updateErrorFailureLog({"Info-Retry-Log": result});

						that.uploadPhoto(
							imageList, 
							index, 
							length, 
							true,
							readyToUpload, 
							currentAuditIndex,
							auditLength);
						return;
					}
					var image = result.info.id;
					imageList[index].image = image;

					if(productId == "storeImage"){
						updateStoreImageId(db, auditId, storeId, image, function(){
							that.uploadPhoto(
								imageList, 
								index+1, 
								length-1, 
								false,
								readyToUpload, 
								currentAuditIndex,
								auditLength);
							return;
							
						}, function(a, e){
							that.uploadPhoto(
								imageList, 
								index, 
								length, 
								false,
								readyToUpload, 
								currentAuditIndex,
								auditLength);
							return;

						});
					}else{


                       updateProductImageId(db, auditId, storeId, productId, image, normId, function(){

                            that.uploadPhoto(
                                imageList,
                                index+1,
                                length-1,
                                false,
                                readyToUpload,
                                currentAuditIndex,
                                auditLength);
                            return;

                        }, function(a, e){
                            that.uploadPhoto(
                                imageList,
                                index,
                                length,
                                false,
                                readyToUpload,
                                currentAuditIndex,
                                auditLength);
                            return;
                        });

					}
		    	}else{
		    	    that.updateErrorFailureLog({"Info-Retry-Log": result});

		    		that.uploadPhoto(
		    			imageList, 
		    			index, 
		    			length, 
		    			true,
						readyToUpload, 
						currentAuditIndex,
						auditLength);
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
					that.uploadPhoto(
						imageList, 
						index+1, 
						length-1,
						false,
						readyToUpload, 
						currentAuditIndex,
						auditLength);
					return;

		    	}else{ 
					that.updateErrorFailureLog({"Info-Retry-Log": e});
		    		if(that.retry < 2){
			    		//Retry the same image
			    		that.uploadPhoto(
			    			imageList, 
			    			index, 
			    			length, 
			    			true,
							readyToUpload, 
							currentAuditIndex,
							auditLength);
			    		return;
			    	}else{
			    		that.upload(
			    			readyToUpload, 
			    			currentAuditIndex+1, 
			    			auditLength-1
			    		);
			    		//inswit.hideLoaderEl();
			    		//that.$(".upload_container").show();
			    		//inswit.alert("Image upload failed! Try again later!");
			    		//that.$el.find(".upload_all").removeClass("clicked");
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
			//this.$(".upload_container").show();
			//inswit.hideLoaderEl();
            var that = this;
			if(error){
				imageList[index].error = error;
			}
			var pVariables = {
			    "projectId":inswit.ERROR_LOG.projectId,
			    "workflowId":inswit.ERROR_LOG.workflowId,
			    "processId":inswit.ERROR_LOG.processId,
			    "ProcessVariables":{
			    	"isSellerAudit": inswit.ISSELLERAUDIT,
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
                	//inswit.hideLoaderEl();
                	switch(error){
                		case 0:{
                		    if(that.checkError) {
                		        that.errorStack.push("No Internet Connection!")
                		    }
                			//inswit.alert("No Internet Connection!");
                			break;
                		}
                		case 1:{
                		     if(that.checkError) {
                                that.errorStack.push("Check your network settings!")
                             }
                			 //inswit.alert("Check your network settings!");
                			break;
                		}
                		case 2:{
                		    if(that.checkError) {
                                that.errorStack.push("Server Busy.Try Again!")
                            }
                			//inswit.alert("Server Busy.Try Again!");
                			break;
                		}
                	}
                }
            });
		},

		uploadAudit: function(
			imageList,
			readyToUpload, 
			currentAuditIndex,
			auditLength) {

			var that = this;

			var success = checkConnection();
		   	if(!success) {
		   		//inswit.hideLoaderEl();
		   		inswit.alert("No Internet Connection!", "Alert");
		   		that.$el.find(".upload_all").removeClass("clicked");
		   		return;
		   	}

		   	selectAllCompProducts(db, that.auditId, that.storeId, function(products){

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

			   		var lat = result.lat;
			   		var lng = result.lng;

			   		var updateStorePosition = false;
			   		if(lat == "" || lng == ""){
			   			updateStorePosition = true;
			   		}

			   		//Query audit details from the database
			   		var mId = that.auditId + "-" + that.storeId + "-" + that.channelId;
			   		selectCompletedAudit(db, mId, function(audit){

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

							//inswit.errorLog({"Info": "Audit Upload initiated"});

							//Upload the Store details to the Appiyo server
							inswit.executeProcess(processVariables, {
								success: function(response){
									if(response.Error == "0"){

									//inswit.errorLog({"Info": "Audit Upload completed"});
										// if(response.ProcessVariables.status == "10"){
										// 	// inswit.alert(response.ProcessVariables.message);
										// 	readyToUpload[currentAuditIndex].message = response.ProcessVariables.message;
										// 	// router.navigate("/audits", {
						    //  //                    trigger: true
						    //  //                });

						    //                 that.upload(
										// 		readyToUpload, 
										// 		currentAuditIndex+1,
										// 		auditLength-1
										// 	);
										// 	inswit.clearPhoto(imageList);

										// 	return;
										// }

										inswit.clearPhoto(imageList);

										// var template = "<div class='success_container'>\
										// 		<img src='images/matrix_icons/success_48.png' align='middle'>\
										// 		<p class='alert_msg'>Store details for <br/><b>{{name}}</b><br/>has been updated successfully</p>\
										// 		<a class='go_audit_list btn btn-success' href='#audits'>Go to Store List</button>\
										// 	</div>";

										// var html = Mustache.to_html(template, {"name":that.storeName});
										// inswit.hideLoaderEl();
										// that.$el.empty().append(html);

										var auditDetails = {
											"auditId": that.auditId,
											"storeId": that.storeId,
											"date": new Date(),
										}
										readyToUpload[currentAuditIndex].isUploaded = true;

										populateAuditHistoryTable(db, auditDetails);

										removeAuditEntries(db, that.auditId, that.storeId);

										that.upload(
											readyToUpload, 
											currentAuditIndex+1,
											auditLength-1
										);

									}else{
							
										// if(response.ProcessVariables.status == "10"){

										// 	that.upload(
										// 		readyToUpload, 
										// 		currentAuditIndex+1,
										// 		auditLength-1
										// 	);

										// }else{
											//inswit.alert("Server Error. Try Again Later!", "Error");
											
											
										that.upload(
											readyToUpload, 
											currentAuditIndex+1,
											auditLength-1
										);
										//}

										//inswit.clearPhoto(imageList);

										var pVariables = {
										    "projectId":inswit.ERROR_LOG.projectId,
										    "workflowId":inswit.ERROR_LOG.workflowId,
										    "processId":inswit.ERROR_LOG.processId,
										    "ProcessVariables":{
										    	"errorType": inswit.ERROR_LOG_TYPES.UPLOAD_AUDIT,
										    	"isSellerAudit": inswit.ISSELLERAUDIT,
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
										    	//inswit.hideLoaderEl();
										    	if(response.ProcessVariables){
										    	
										    	}
							                }, failure: function(error, response){
							                	//inswit.hideLoaderEl();
							                	that.updateErrorFailureLog({"Audit upload failed": response});
							                	switch(error){
							                		case 0:{
                                                        if(that.checkError) {
                                                            that.errorStack.push(that.storeId +": No Internet Connection!")
                                                        }
                                                        //inswit.alert("No Internet Connection!");
                                                        break;
                                                    }
                                                    case 1:{
                                                         if(that.checkError) {
                                                            that.errorStack.push(that.storeId +": Check your network settings!")
                                                         }
                                                         //inswit.alert("Check your network settings!");
                                                        break;
                                                    }
                                                    case 2:{
                                                        if(that.checkError) {
                                                            that.errorStack.push(that.storeId +": Server Busy.Try Again!")
                                                        }
                                                        //inswit.alert("Server Busy.Try Again!");
                                                        break;
                                                    }
							                	}
							                }
							            });
									}
								}, failure: function(error, response){
									//inswit.hideLoaderEl();
									that.upload(
										readyToUpload, 
										currentAuditIndex+1,
										auditLength-1
									);
					                that.updateErrorFailureLog({"Audit upload failed": response});
									switch(error){
                                        case 0:{
                                            if(that.checkError) {
                                                that.errorStack.push(that.storeId +": No Internet Connection!")
                                            }
                                            //inswit.alert("No Internet Connection!");
                                            break;
                                        }
                                        case 1:{
                                             if(that.checkError) {
                                                that.errorStack.push(that.storeId +": Check your network settings!")
                                             }
                                             //inswit.alert("Check your network settings!");
                                            break;
                                        }
                                        case 2:{
                                            if(that.checkError) {
                                                that.errorStack.push(that.storeId +": Server Busy.Try Again!")
                                            }
                                            //inswit.alert("Server Busy.Try Again!");
                                            break;
                                        }
                                    }
								}
							});
						}
					});
			   	});
		   	});
		},

		updateErrorFailureLog: function(error) {
            var that = this;
		    var pVariables = {
                "projectId":inswit.ERROR_LOG.projectId,
                "workflowId":inswit.ERROR_LOG.workflowId,
                "processId":inswit.ERROR_LOG.processId,
                "ProcessVariables":{
                    "errorType": inswit.ERROR_LOG_TYPES.BULK_UPLOAD_FAIL,
                    "isSellerAudit": inswit.ISSELLERAUDIT,
//                    "auditId": that.auditId,
//                    "storeId": that.storeId,
                    "empId":LocalStorage.getEmployeeId(),
                    "issueDate":new Date(),
                    "issueDescription": JSON.stringify(error),
                    "version": inswit.VERSION
                }
            };

            inswit.executeProcess(pVariables, {
                success: function(response){
                   // inswit.hideLoaderEl();
                    if(response.ProcessVariables){

                    }
                }, failure: function(error){
                    //inswit.hideLoaderEl();
                    switch(error){
                        case 0:{
                            if(that.checkError) {
                                that.errorStack.push(that.storeId +": No Internet Connection!")
                            }
                            //inswit.alert("No Internet Connection!");
                            break;
                        }
                        case 1:{
                             if(that.checkError) {
                                that.errorStack.push(that.storeId +": Check your network settings!")
                             }
                             //inswit.alert("Check your network settings!");
                            break;
                        }
                        case 2:{
                            if(that.checkError) {
                                that.errorStack.push(that.storeId +": Server Busy.Try Again!")
                            }
                            //inswit.alert("Server Busy.Try Again!");
                            break;
                        }
                    }
                }
            })
             ;
		}



	});

	return UploadAll;
});