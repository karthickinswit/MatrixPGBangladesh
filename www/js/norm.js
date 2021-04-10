define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var Norm = {};
	Norm.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	Norm.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .take_product_photo": "takeProductPicture",
			"click .retake_product_photo": "takeProductPicture",
			"change .option": "onChangeOption",
			"change #frontage_applicable" : "toggleFrontage",
			"change #device_applicable" : "toggleDevice",
			"change #device_remark" : "deviceRemark",
			"change #frontage_remark" : "frontageRemark",
			"change .hotspot_decision" : "toggleHotspot",
			"click .product_done": "done",
			"click .back": "back",
			"change .execution_checkbox": "nonExecutionBrand"
		},

		showNorms: function(mId, pId, product, hotspotPid){
			var that = this;

			var tPhoto;

			this.getStoreName(mId);

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

            var productName = product.product_name;
            var priority = product.priority;

            var pName = productName.toLowerCase().trim();

            var brandName = pName.replace(/\s/g, '');
            var hotspotExecution = false;
            if(brandName == "hotspotexecution"){
            	hotspotExecution = true;
            }

            this.isFrontage = false;
            if(product.is_frontage == "true" && product.priority == 6){
            	this.isFrontage = true;
            }else if(product.is_frontage == "false" && product.priority == 8){
                 this.isFrontage = false;
            }else if(product.is_frontage == "false" && !hotspotExecution){
                this.isDevice = true;
            }

			//Show completed norms(With user modified values)
			var fn = function(results){
				if(results.length > 0){
					require(['templates/t_audit_questions'], function(template){

						var callback = function(norms){
							selectProduct(db, pId, channelId, function(product){
								//Set first question as a frontage norm
								if(that.isFrontage && norms[0]){
									norms[0].isFrontage = that.isFrontage;
								}

								if(that.isDevice && norms[0]) {
								    norms[0].isDevice = that.isDevice;
								}

								//Set first question as a hotspot decision norm
								if(hotspotExecution && norms[0]){
									norms[0].hotspotExecution = hotspotExecution;
								}



								for(var i = 0; i < norms.length; i++){
									var norm = norms[i];

                                    norm.imageURI = results[i].imageURI;
                                    norm.photoBox = true;

                                    norm.takePhoto = true;
                                    if(norm.imageURI.length > 0) {
                                        norm.takePhoto = false;
                                    }

									var no = norm.no;
									var yes = norm.yes;
									var options = norm.options;

									for(var j = 0; j < results.length; j++){
										var result = results[j];
										if(norm.normId == result.normId){

										    if(norm.photoBox == true) {

										        norm.imageURI = result.image;
										        norm.isImage = (result.image.length > 0)? true:false;

										    }else {

										        for(var k = 0; k < options.length; k++){
                                                    if(result.optionId == options[k].optionId){
                                                        options[k].selected = "selected";
                                                        break;
                                                    }
                                                }

                                                var isOk = false;
                                                for(var l = 0; l < yes.length; l++){
                                                    if(result.remarkId == yes[l].remarkId){
                                                        yes[l].selected = "selected";
                                                        norm.show1 = "block";
                                                        norm.show2 = "none";
                                                        isOk = true;
                                                        break;
                                                    }
                                                }

                                                if(!isOk){
                                                    for(var m = 0; m < no.length; m++){
                                                        if(result.remarkId == no[m].remarkId){
                                                            no[m].selected = "selected";
                                                            norm.show1 = "none";
                                                            norm.show2 = "block";
                                                            break;
                                                        }
                                                    }
                                                }

                                                break;
										    }
										}
									}
								}

								var isImage = false;
								var imageURI = results[0].imageURI || "";
								if(imageURI){
									isImage = true;
								}

								/*var takePhoto = false;
								if(!imageURI && priority == 6){
									takePhoto = true;
								}

								if(!imageURI && priority == 10){
									takePhoto = true;
								}*/

                               // var takePhoto = (results[0].nonExecution == "true")? true:false;
                                var nonExecution = (results[0].nonExecution == "true")? true:false;

								var html = Mustache.to_html(
									template,
									{
										"norms":norms, 
										"mId":mId, 
										"productName":productName,
										"productId":pId,
										"name":that.storeName,
										//"imageURI":imageURI,
										"isImage":isImage,
										//"takePhoto":takePhoto,
										"element":"retake_product_photo",
										"priority": priority,
										"nonExecution": nonExecution
									}
								);

								that.$el.empty().append(html);

							/*	var nonExecution = results[0].nonExecution;
                                var isChecked = (nonExecution == "true")? true:false;
                                if(isChecked) {
                                    that.$el.find(".execution_checkbox").attr("checked", true);
                                    that.$el.find(".take_product_photo, .take_second_product_photo").prop('disabled', true);
                                }else if(!isChecked && isImage) {
                                    that.$el.find(".execution_checkbox").attr("disabled", true);
                                }*/


								//that.$el.find("#frontage_applicable").trigger("change");
								that.$el.find("#device_applicable").trigger("change");
								
								//toggleHotspot function will disable certain elements based on hotspot decision value
								if(priority == 10){
									var hotspotDecision = $(".hotspot_decision").val().replace(/\s/g, '').toLowerCase();
									if(hotspotDecision == "no"){
										that.toggleHotspot("", "no");

										//Hide all other norms except first
										var elements  = $(".question");
										for(var i = 1; i < elements.length; i++){
											$(elements[i]).hide();
										}	
									}
								}

								if(priority == 8){
									var success = function(results){
										if(results.item(0)){
											if(results.item(0).option_name.replace(/\s/g, '').toLowerCase() == "no"){
												that.$el.find(".question_list .norms").prepend("<div class='warning_msg'>This hotspot brand can not be edited. Because hotspot execution is not available</div>");
												that.toggleHotspot("", "no", true);
											}
										}
									}

									selectHotSpotExecutionDecision(db, auditId, storeId, hotspotPid, success);
								}
								
								that.refreshScroll("wrapper_norms");

								return that;
							});
						}

						selectNorms(db, channelId, pId, priority, product.is_frontage, callback);
						
						return that;
					});
				}else{
					//Render first time(Default options)
					var callback = function(norms){
						//Set first question as a frontage norm
						if(that.isFrontage && norms[0]){
							norms[0].isFrontage = that.isFrontage;
						}
						//Set first question as a hotspot decision norm
						if(hotspotExecution && norms[0]){
							norms[0].hotspotExecution = hotspotExecution;
						}

						if(that.isDevice && norms[0]) {
                            norms[0].isDevice = that.isDevice;
                        }

						selectProduct(db, pId, channelId, function(product){
							require(['templates/t_audit_questions'], function(template){
								var takePhoto = false;
								if(product.priority == 6 || product.priority == 10){
									takePhoto = true;
								}
								norms.productName = productName;
								norms.productId = pId;
								norms.mId = mId;

								var html = Mustache.to_html(
									template,
									{
										"norms":norms, 
										"mId":mId,
										"productName":productName,
										"productId":pId, 
										"name":that.storeName,
										"takePhoto": takePhoto,
										"element":"retake_product_photo",
										"priority": priority
									}
								);
								that.$el.empty().append(html);
								that.refreshScroll("wrapper_norms");					
				
								return that;
							});
						});
					}

					selectNorms(db, channelId, pId, priority, product.is_frontage, callback);
				}
			}
			
			selectProductsToVerify(db, auditId, storeId, pId, fn);
		},

		takeProductPicture:function(event){
			var that = this;

			var mId = $(".product_done").attr("href");

			var normId = event.currentTarget.id || event.currentTarget.parentNode.id;


			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			getStoreCode(db, storeId, function(storeCode){
			 	var callback = function(imageURI){
					that.refreshScroll("wrapper_norms");
				}

				var takeEl = "take_product_photo";
				var retakeEl = "retake_product_photo";
				inswit.takePicture(callback, takeEl, retakeEl, storeCode, normId);
			});
		},

		onChangeOption: function(e){
			var option = e.target.options[e.target.selectedIndex].text
			
			if(option == "Yes" || option == "100"){
				$(e.target).parents(".question").find(".remarks_1").show();
				$(e.target).parents(".question").find(".remarks_2").hide();
				this.selectFirstOption(e, "remarks_1");
			}else{
				$(e.target).parents(".question").find(".remarks_1").hide();
				$(e.target).parents(".question").find(".remarks_2").show();
				this.selectFirstOption(e, "remarks_2");
			}
		},

		selectFirstOption: function(event, selector) {
		    var size = $(event.target).parents(".question").find("."+selector+" select option").size();
            if(size == 2) {
                $(event.target).parents(".question").find("."+selector+" select option:eq(1)").prop('selected', true);
            }
		},

		selectSecondOption: function(event, selector) {
            var size = $(event.target).parents(".question").find("."+selector+" select option").size();
            if(size == 2) {
                $(event.target).parents(".question").find("."+selector+" select option:eq(2)").prop('selected', true);
            }
        },

		toggleFrontage: function(event){
			var value = $(event.currentTarget).val().toLowerCase();

			var elements = this.$el.find(".question");

			if(value == "yes"){
				$(event.target).parents(".question").find(".remarks_1").show();
				$(event.target).parents(".question").find(".remarks_2").hide();

				for(var i = 1; i < elements.length; i++){
					var normEl = $(elements[i]);
					var val = normEl.find(".option").val();

					if(!val || val == "" || val == undefined){
						normEl.find(".option").prop("selectedIndex", 1);
					}
				}

				$(".normal, .take_product_photo, .photo_block").show();
				this.selectFirstOption(event, "remarks_1");

			}else{
			    var remarkValue = elements.find("#frontage_remark").val();

			    if(remarkValue != 46 && remarkValue != "select" && !this.isFrontage) {
			        $(".remarks_1").hide();
                    $(".remarks_2").show();
                    for(var i = 1; i < elements.length; i++){
                        var normEl = $(elements[i]);
                        normEl.find(".option").prop("selectedIndex", 2);
                        normEl.find(".audit_no").val("50");

                        if(normEl.find(".audit_no").val() !== "50"){
                            normEl.find(".audit_no").prop("selectedIndex", 1);
                        }

                    }
                    $(".normal, .take_product_photo, .photo_block").hide();
                    this.selectFirstOption(event, "remarks_2");
			    }
			}

			this.refreshScroll("wrapper_norms");
		},

		toggleDevice: function(event) {

		    var value = $(event.currentTarget).val().toLowerCase();

            var elements = this.$el.find(".question");


            if(value == "no") {
                $(".remarks_1").hide();
                $(".remarks_2").show();
                for(var i = 1; i < elements.length; i++){
                    var normEl = $(elements[i]);
                    normEl.find(".option").prop("selectedIndex", 2);
                    normEl.find(".audit_no").val("50");

                    if(normEl.find(".audit_no").val() !== "50"){
                        normEl.find(".audit_no").prop("selectedIndex", 1);
                    }

                }
                $(".normal, .take_product_photo, .photo_block").hide();
                //this.selectFirstOption(e, "remarks_2");
            }else {
                $(".normal, .take_product_photo, .photo_block").show();

                 var elements = this.$el.find(".question");


                 for(var i = 1; i < elements.length; i++){
                    var normEl = $(elements[i]);
                    normEl.find(".option").prop("selectedIndex", 0);
                    normEl.find(".audit_no").val("50");

                    if(normEl.find(".audit_no").val() !== "50"){
                        normEl.find(".audit_no").prop("selectedIndex", 0);
                    }

                 }
            }
		},

		frontageRemark: function(event) {
		    var value = $(event.currentTarget).val().toLowerCase();

		    var elements = this.$el.find(".question");


		   /* if(value!= "46" && value != "select") {
		        $(".remarks_1").hide();
                $(".remarks_2").show();
                for(var i = 1; i < elements.length; i++){
                    var normEl = $(elements[i]);
                    normEl.find(".option").prop("selectedIndex", 2);
                    normEl.find(".audit_no").val("50");

                    if(normEl.find(".audit_no").val() !== "50"){
                        normEl.find(".audit_no").prop("selectedIndex", 1);
                    }

                }
                $(".normal, .take_product_photo, .photo_block").hide();
                //this.selectFirstOption(e, "remarks_2");
		    }else {*/
           $(".normal, .take_product_photo, .photo_block").show();

           var elements = this.$el.find(".question");


           for(var i = 1; i < elements.length; i++){
                var normEl = $(elements[i]);
                normEl.find(".option").prop("selectedIndex", 0);
                normEl.find(".audit_no").val("50");

                if(normEl.find(".audit_no").val() !== "50"){
                    normEl.find(".audit_no").prop("selectedIndex", 0);
                }

           }
        /*}*/

		    this.refreshScroll("wrapper_norms");
		},

		toggleHotspot: function(event, value, isHotSpotBrand){

			if(event){
				value = $(event.currentTarget).val().toLowerCase();
			}
			
			var elements = this.$el.find(".question");
			elements.show();
			if(value == "select"){
				$(".remarks_2").hide();
				$(".remarks_1").show();

				$(".option").prop("selectedIndex", 0).prop("disabled", false);
				$(".audit_yes").prop("selectedIndex", 0).prop("disabled", false);

				$(".take_product_photo, .photo_block").show();

			}else if(value == "yes"){
				$(".remarks_2").hide();
				$(".remarks_1").show();

				$(".option").prop("selectedIndex", 0).prop("disabled", false);
				$(".audit_yes").prop("selectedIndex", 0).prop("disabled", false);

				$(".audit_no").prop("disabled", false);

				var normEl = $(elements[0]);
				normEl.find(".option").prop("selectedIndex", 1);

				$(".take_product_photo, .photo_block").show();

				this.selectFirstOption(event, "remarks_1");

			}else{
				$(".remarks_1").hide();
				$(".remarks_2").show();

				var index = 0;
				if(!isHotSpotBrand){
					index = 1;

					var normEl = $(elements[0]);
					normEl.find(".audit_no").prop("selectedIndex", 1);
				}else{
					$(".product_done").hide();
				}
				
				for(var i = index; i < elements.length; i++){
					normEl = $(elements[i]);
					normEl.find(".option").prop("selectedIndex", 2).trigger("change").prop("disabled", true);
					normEl.find(".audit_no").val("44").prop("disabled", true);

					if(!isHotSpotBrand && i > 0){
						$(elements[i]).hide();
					}
				}

				$(".take_product_photo, .photo_block").hide();
			}

			this.refreshScroll("wrapper_norms");
		},

		//Store the product details in client side DB temporarly.
		update: function(mId, auditId, storeId, channelId){
			var that = this;
			var nonExecution;

			var takePhoto = "no";
			var ele = that.$el.find(".norms");
			var priority = ele.attr("href");

			var hotspotDecision;
			if($(".hotspot_decision").val()){
				hotspotDecision = $(".hotspot_decision").val().trim().toLowerCase();
			}
			
			if(priority == 10 && hotspotDecision != "no"){
				takePhoto = "yes"
			}

			if(priority == 6){
				takePhoto = "yes"
				if(that.$el.find("#device_applicable").val()) {
				    takePhoto = that.$el.find("#device_applicable").val().toLowerCase() || "no";
				}
			}

			if(that.$el.find("#frontage_applicable").val()){
				takePhoto = that.$el.find("#frontage_applicable").val().toLowerCase() || "no";
			}

			if(this.isFrontage) {
			    takePhoto = "yes"
			}

			getDistributor(db, auditId, storeId, function(distributor){

                var remarkValue = that.$el.find("#frontage_remark").val();


				var image = $(".photo_block img").attr("src") || "";;
	 			/*if(distributor != inswit.DISTRIBUTOR){ //For certain distributor photo is not mandatory
					if(takePhoto == "yes" && !image ){
						inswit.alert("Please take a brand photo!");
						return;
					}
	 			}*/

				if(takePhoto == "no" && remarkValue != "46"){
					image = "";
				}


				var product = {};
				product.storeId = storeId;
				product.auditId = auditId;
				product.storeName = that.storeName;
				product.isContinued = true;
				product.isCompleted = false;
				product.image = "";
				product.imageId = "";
				product.norms = that.getValues();
				//product.nonExecution = isChecked;
				//product.imageURI = image || "";
				product.priority = priority;

				if(product.norms && product.norms.length > 0) {
					var callback = function(){
						//HotspotDescision is 'no' means we have to
						//update all hotspot brand norms as 'no'
						if(hotspotDecision == "no"){
							that.getAllHotspotBrands(auditId, storeId, channelId);
							window.history.back();
						}else if(hotspotDecision == "yes"){
							//Remove all hotspot brands from completed product table
							removeBrands(db, auditId, storeId);
							//If it is in verify page we need to go back and to do audits
							//for all other hotspot brands
							if(that.model.get("isVerify")){
								var route = "#audits/" + mId + "/products";
								router.navigate(route, {
					                trigger: true,
					                replace: true
					            });
							}else{
								window.history.back();
							}
						}else{
							window.history.back();
						}
					}

					populateCompProductTable(db, product, callback);
					/*if(isChecked) {
                        inswit.confirm(inswit.alertMessages.no_execution, function onConfirm(buttonIndex) {
                            if(buttonIndex == 2) {
                                return;
                            }else if(buttonIndex == 1) {
                                if(inswit.TIMER != 0) {
                                    populateCompProductTable(db, product, callback);
                                }
                            }
                        }, "Confirm", ["Yes", "No"]);
                    }else {
                        populateCompProductTable(db, product, callback);
                    }*/
				}else{
					//inswit.alert("No norms mapped to this product! \n Contact your administrator");
				}
	 		}, function(){

	 		});
		},

		getAllHotspotBrands: function(auditId, storeId, channelId){
			var that = this;

            var callback = function(response){

            	var len = response.rows.length;
            	for(var i = 0; i < len; i++){
	                var obj = response.rows.item(i);
	                var pId = obj.product_id;
	                var pName = obj.product_name;
	                var priority = obj.priority;

					that.selectHotSpotNorms(auditId, storeId, channelId, pId, pName, priority);
	            }
			};
				
			var error = function(e, a){};

			selectAllHotSpotBrands(db, auditId, storeId, channelId, callback, error);
		},

		selectHotSpotNorms: function(auditId, storeId, channelId, pId, pName, priority){
			var that = this;

			var fn = function(norms){
            	var product = {};
				product.storeId = storeId;
				product.auditId = auditId;
				product.storeName = that.storeName;
				product.isContinued = true;
				product.isCompleted = false;
				product.image = "";
				product.imageId = "";
				product.norms = that.getDefaultValues(norms, pId, pName, priority);
				product.imageURI = "";
				product.priority = priority;

				var cb = function(){}

				populateCompProductTable(db, product, cb);
			}

			selectNorms(db, channelId, pId, priority, "false", fn);
		},

		getDefaultValues: function(norms, pId, pName, priority){
			var values = [];
			for(var i = 0; i < norms.length; i++){
				var norm = norms[i];
				
				//Getting default options
				var optionName, optionId, remarkName, remarkId;
				for(var j = 0; j < norm.options.length; j++){
					var option = norm.options[j];

					if(option.optionName.replace(/\s/g, '').toLowerCase() == "no"){
						optionName = option.optionName;
						optionId = option.optionId;
						break;
					}
				}

				//Getting default remarks
				for(var k = 0; k < norm.no.length; k++){
					var remark = norm.no[k];

					if(remark.remarkId == "44"){
						remarkName = remark.remarkName;
						remarkId = remark.remarkId;
						break;
					}
				}

				var value = {};
				value.productName = pName;
				value.productId = pId;
				value.isConsider = norm.isConsider;
				value.normName = norm.normName;
				value.normId = norm.normId;
				value.optionName = optionName;
				value.optionId = optionId;
				value.remarkName = remarkName;
				value.remarkId = remarkId;

				values.push(value);
			}

			return values;
		},

		getValues: function(){

			var elements = this.$el.find(".question");
			this.$(".norms").find(".error").removeClass("error");

            var productName = this.$el.find(".product_header h2").text();
			var productId = this.$el.find(".product_header h2").attr("id");
			var norms = [];
			for(var i = 0; i < elements.length; i++){
				var norm = {},
					remarkName,
					remarkId;

				var normEl = $(elements[i]);
				var normType = normEl.attr("id");
				var isConsider = normEl.attr("rel") || false;
				var normName = normEl.find(".product_name").attr("rel");
				var normId = normEl.find(".product_name").attr("id");

				var fieldType = normEl.attr("data-field-type");

				var nonExecution = $(".execution_checkbox").is(':checked') ? true:false;



				if(fieldType == "photobox") {
                   var imageUrl = normEl.find(".photo_block img").attr("src") || "";

                   var isChecked = $(".execution_checkbox").is(':checked')

                   if(imageUrl.length == 0 && !isChecked) {
                       normEl.addClass("error");
                       this.scrollView.scrollToElement(normEl[0]);
                      // inswit.alert(inswit.ErrorMessages.checkProceed);
                       return;
                   }/*else if((imageUrl == "" ) || (imageUrl == undefined)) {
                        normEl.addClass("error");
                        this.scrollView.scrollToElement(normEl[0]);
                        return;
                   }*/

                    norm.productName = productName;
                    norm.productId = productId;
                    norm.isConsider = isConsider;
                    norm.normName = normName;
                    norm.normId = normId;
                    norm.imageUrl = imageUrl;
                    norm.optionName = optionName;
                    norm.optionId = "";
                    norm.remarkName = "";
                    norm.remarkId = "";
                    norm.nonExecution = nonExecution;

                    norms.push(norm);

                }else {

                    var optionName = normEl.find(".option option:selected").text();
                    var optionId = normEl.find(".option option:selected").attr("id");

                    if(optionName == "Yes" || optionName == "100"){
                        remarkName = normEl.find(".audit_yes option:selected").text() || "";
                        remarkId = normEl.find(".audit_yes option:selected").attr("id") || "";
                    }else{
                        remarkName = normEl.find(".audit_no option:selected").text() || "";
                        remarkId = normEl.find(".audit_no option:selected").attr("id") || "";
                    }

                    if((optionId == "" ) || (optionId == undefined)) {
                        normEl.addClass("error");
                        this.scrollView.scrollToElement(normEl[0]);
                        return;
                    }

                    if((remarkId == "" ) || (remarkId == undefined)) {
                        normEl.addClass("error");
                        this.scrollView.scrollToElement(normEl[0]);
                        return;
                    }

                    norm.productName = productName;
                    norm.productId = productId;
                    norm.isConsider = isConsider;
                    norm.normName = normName;
                    norm.normId = normId;
                    norm.optionName = optionName;
                    norm.optionId = optionId;
                    norm.remarkName = remarkName;
                    norm.remarkId = remarkId;

                    norms.push(norm);
                }
			}

			return norms;
		},

		done: function(event){
			var that = this;

			var mId = $(event.currentTarget).attr("href");
			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			var takePhoto = "no";
			var ele = that.$el.find(".norms");
			var priority = ele.attr("href");

			if(priority == 8){
				var success = function(results){
					if(results.length == 0){
						inswit.alert("Please Audit Hotspot Execution first before audit hotspot brand");
					}else{
						that.update(mId, auditId, storeId, channelId);
					}
				}

				var hotspotPid = that.model.get("hotspotPid");
				selectHotSpotExecutionDecision(db, auditId, storeId, hotspotPid, success);
			}else{
				that.update(mId, auditId, storeId, channelId);
			}
		},

		getStoreName: function(mId){
			var that = this;

			fetchStoreName(db, mId, function(result){
				that.storeName = result.storeName;
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
		},

		nonExecutionBrand: function(event) {
		    var target = $(event.currentTarget);
            if(target.is(':checked')) {
               $(".question").find(".take_product_photo").prop('disabled', true);
            }else {
               $(".question").find(".take_product_photo").prop('disabled', false);
            }
        }

	});

	return Norm;
});