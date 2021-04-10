define([
	"backbone", 
	"mustache",
	"templates/t_audits",
	"select2"
], function(Backbone, Mustache, template) {
	var Audit = {};
	Audit.Model = Backbone.Model.extend({
		defaults:{
			start:0,
			perPage:5,
			searchKey: "",
			header: '<div class="audit_header audit_home_header">\
						<img src="images/logo.png" class="logo ico_48 pull-left">\
						<div class="left_content">\
							<div class="center_content font_18">Audit List\
							</div>\
							<div class="pull-right font_12 header_cont">\
							<a class="force_clear"><i class="force_clear_ico ico_32"></i></a>\
							<a class="refresh_list"><i class="refresh_ico logout_ico ico_32"></i></a>\
							<a class="logout"><i class="logout_ico ico_32"></i></a>\
							<a class="bulk_upload"><i class="upload_ico ico_24"></i></a>\
							</div>\
						</div>\
					</div>\
					<div class="filter_container"></div>\
					<div class="search_container">\
						<input class="search font_18" placeholder="Search store name or store code" disabled>\
					</div>\
					<div class="view_container scroll_parent" id="wrapper_audit"><div class="audit_list scroll_ele"></div></div>\
					<div class="modal_container"></div>',
		},

		initialize: function() {}                             
	});

	Audit.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .audit": "showAudit",
			"click .back": "back",
			"keyup .search": "searchAudit",
			"click .logout" : "logOut",
			"click .filterValues" : "renderFilterDialog",
			"click .reset_filter" : "resetFilterValues",
			"change .distributor_name" : "onChangeDistributor",
			"change .distributor_location" : "onChangeLocation",
			"click .refresh_list" : "getAudits",
			"click .force_clear": "forceClear",
			"click .bulk_upload" : "showCompletedAuditList"
		},

		filter : {
			branchId : "",
			distId : "",
			locationId : ""
		},

		initialize: function() {
			this.filter = JSON.parse(LocalStorage.getAuditFilter());
			this.scrollView = null;
			this.alreadyStarted = false;

			var mId = this.model.get("mId");

			if(mId){
				this.getStoreName(mId);
			}else{
				this.storeName = "";
			}
		},

		loaderEl : $(".loader-container"),

		render: function() {
			var that = this;
			inswit.showLoaderEl("Loading Audits");

			//Append filter header template
			this.$el.append(this.model.get("header"));

			//Fetch audits from local database
			this.fetchAudit();
			this.getAudits();

			if(this.timeOut){
				clearTimeout(this.timeOut);
				this.timeOut = null;
			}

			this.timeOut = setTimeout(function(){
				inswit.hideLoaderEl();
			}, 30000);
		},

		getAudits: function(event) {
			var that = this;

			var processVariables = {
			    "projectId":inswit.GET_ASSIGNED_AUDIT_PROCESS.projectId,
			    "workflowId":inswit.GET_ASSIGNED_AUDIT_PROCESS.workflowId,
			    "processId":inswit.GET_ASSIGNED_AUDIT_PROCESS.processId,
			    "ProcessVariables":{
			    	"empId":LocalStorage.getEmployeeId(),
			    	"date":LocalStorage.getLastUpdatedDate() || "",
			    	"version": inswit.VERSION
			    }
			};
			
			inswit.executeProcess(processVariables, {
			    success: function(response){
			    	if(!response.ProcessVariables.status){
			    		inswit.alert(response.ProcessVariables.response);
			    		inswit.hideLoaderEl();
			    		if(response.ProcessVariables.isOlder){
			    			inswit.sessionOut();
			    		}
			    	}

			    	var cutOffTime = response.ProcessVariables.cutOffTime;
                    LocalStorage.setAuditTimeLimit(cutOffTime);

		    		if(response.ProcessVariables.isUpdate){
			    		inswit.alert("Master data is changed!. Hereafter you can do audits based on new modification");

			    		that.fetchUpdatedMasterData(function(){
			    			if(response.ProcessVariables.stores){
			    				//inswit.alert("Stores loded from server:- " + response.ProcessVariables.stores.length);

								var storesDetails = response.ProcessVariables;

								var callback = function(){
	                        		that.fetchAudit("", true, storesDetails, true);
	                        		inswit.hideLoaderEl();
		                        }
							
	                        	populateAllStoreTable(db, storesDetails, callback);

		                    }else {
		                    	//inswit.alert("Stores are not coming from the server:");

		                    	inswit.hideLoaderEl();
		                    	that.fetchAudit("", true, [], true);
		                    }
			    		});
			    	}else{

			    		if(response.ProcessVariables.stores){
			    			//inswit.alert("Stores loded from server: " + response.ProcessVariables.stores.length);
							var storesDetails = response.ProcessVariables;

							var callback = function(){
                        		that.fetchAudit("", true, storesDetails, true);
                        		inswit.hideLoaderEl();
	                        }
						
                        	populateAllStoreTable(db, storesDetails, callback);

	                    }else {
	                    	//inswit.alert("Stores are not coming from the server");
	                    	inswit.hideLoaderEl();
	                    	//var fn = function(){
	                    	that.fetchAudit("", true, [], true);
	                    	// }
	                    	// removeStore(db, fn);
	                    }
			    	}
                }, failure: function(error){
                	switch(error){
                		case 0:{
                			//inswit.alert("No Internet Connection!");
                			break;
                		}
                		case 1:{
                			//inswit.alert("Check your network settings!");
                			break;
                		}
                		case 2:{
                			//inswit.alert("Login Failed.Try Again!");
                			break;
                		}
                	}
                }
            });
		},

		fetchAudit: function(searchKey, isShow, newAuditDetails, isConsider){
			var that = this;

			this.renderFilterHeader();
			try{

				var filterObj = JSON.parse(LocalStorage.getAuditFilter());
				selectAllStores(db, searchKey, filterObj, function(auditList, more){
					if(isConsider)
						//inswit.alert("Stores loaded from DB:- " + auditList.length);
					if(auditList.length == 0){
						
						if(isShow){
							that.$el.find(".audit_list").empty().append("<div class='no_audit'>No audits found</div>");
						}
						return;
					}else{
						inswit.hideLoaderEl();
					}
					
					var completedAudit = false;
					selectAllCompletedAudit(db, function(audits){
						//Clear unwanted last month(expired) audits from database
						//inswit.clearAudits(auditList, audits, newAuditDetails, isConsider);

						//if(isConsider)
						//inswit.alert("After clearing unwanted audits:- " + auditList.length);

						selectAuditHistories(db, function(auditHistory){

                            for(var i = 0; i < auditList.length; i++){
                                auditList[i].audited = false;

                                for(var j = 0; j < auditHistory.length; j++){
                                    var item = auditHistory.item(j);
                                    if(auditList[i].id === item.store_id){
                                        auditList[i].audited = true;
                                        break;
                                    }
                                }
                            }

						    var completedAuditLength = audits.length;
					
                            inswit.setColorCode(auditList, function(auditList){
                                var length = auditList.length;
                                if(completedAuditLength > 0){
                                    completedAudit = true;
                                    for(var i = 0; i < length; i++){
                                        var audit = auditList[i];

                                        if(audit.is_fresh === "true" || audit.is_fresh === true){
                                            audit.auditColor = inswit.BGCOLOR[0];
                                        }else{
                                            audit.auditColor = inswit.BGCOLOR[1];
                                        }

                                        for(var j = 0; j < completedAuditLength; j++){
                                            var completedAudit = audits[j];
                                            if(audit.auditId == completedAudit.audit_id && audit.id == completedAudit.store_id){

                                                if((completedAudit.audited == "true" && completedAudit.comp_audit == "false")
                                                    || (completedAudit.audited == "false" && completedAudit.comp_audit == "false")){
                                                    audit.partial = true;
                                                    /*that.removePartilAudit(audit.mId, function() {
                                                        console.log("removed partial Audit");
                                                    });*/

                                                    if(!that.alreadyStarted) {
                                                        inswit.showLoaderEl("Checking for partial completed store! Please wait...");
                                                        that.checkRemainingTime(audit.mId, function() {
                                                            router.navigate("/audits/"+ audit.mId, {
                                                                trigger: true
                                                            });
                                                            inswit.alert(inswit.ErrorMessages.oldTimerExceed);
                                                            return;
                                                        });
                                                    }


                                                }else if(completedAudit.comp_audit == "true"){
                                                    audit.completed = true;
                                                }

                                                break;
                                            }

                                            if(j+1 == completedAuditLength){
                                                audit.normal = true;
                                            }
                                        }
                                    }

                                    var html = Mustache.to_html(template.auditMain, {"audits":auditList});
                                    that.$el.find(".audit_list").html(html);

                                }else{

                                    if(length > 0) {
                                        for(var k = 0; k < length; k++){
                                            auditList[k].normal = true;

                                            if(auditList[k].is_fresh === "true" || auditList[k].is_fresh === true){
                                                auditList[k].auditColor = inswit.BGCOLOR[0];
                                            }else{
                                                auditList[k].auditColor = inswit.BGCOLOR[1];
                                            }
                                        }

                                        var html = Mustache.to_html(template.auditMain, {"audits":auditList});
                                        that.$el.find(".audit_list").html(html);
                                    }else {
                                        that.$el.find(".audit_list").append("<div class='no_audit'>No audits found</div>");
                                    }
                                }
                                that.refreshScroll("wrapper_audit");
                            });
                        });
				    });
                });
			}catch(err){
				inswit.alert(err.message);
			}
		},

		showAudit: function(event){
			var that = this;

			var mId = $(event.currentTarget).attr("href");

            selectCompletedAudit(db, mId, function(audit){
            	if(audit.length > 0){
            		audit = audit.item(0);

	            	if((audit.audited == "true" && audit.comp_audit == "false") 
						|| (audit.audited == "false" && audit.comp_audit == "false")){

						router.navigate("/audits/"+ mId + "/continue", {
	                        trigger: true
	                    });
					}else if(audit.audited == "true" && audit.comp_audit == "true"){

						router.navigate("/audits/"+ mId + "/upload", {
	                        trigger: true
	                    });
					}else if(audit.audited == "false" && audit.comp_audit == "true"){

						router.navigate("/audits/"+ mId + "/upload", {
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

		showCompletedAuditList: function(){
			router.navigate("/audits/upload/all", {
                trigger: true,
                replace: true
            });
		},

		renderFilterDialog: function() {
			var that = this;

			var html = Mustache.to_html(template.filterModal);
			this.$(".modal_container").html(html);
			this.$(".modal_container .modal").modal();

			this.filter = JSON.parse(LocalStorage.getAuditFilter());

			this.renderFilterForm();

			this.$(".submit_filter").on("click", function(){

				that.filter = that.getFilterValues();
				var filter = JSON.stringify(that.filter);

				LocalStorage.setAuditFilter(filter);

				inswit.isFilter = true;
				that.$(".modal").modal("hide");
				that.fetchAudit("", true);
			});
		},

		resetFilterValues : function() {
			this.filter = {
				branchId : "",
				distId : "",
				locationId : ""
			};

			this.$('.distributor_name,.distributor_location,.distributor_branch').empty();

			if(this.$('.distributor_location').data("select2")){
				this.$('.distributor_location').select2("destroy").empty();
			}

			if(this.$('.distributor_branch').data("select2")){
				this.$('.distributor_branch').select2("destroy").empty();
			}

			this.renderFilterForm();
		},

		renderFilterForm: function() {
			var that = this;

			fetchDistributors(db, function(distributors){
				var distributorNameOption = Mustache.to_html(
					template.selectDistributor, 
					{options:distributors});

				var dbtrEl = that.$('.distributor_name');
				dbtrEl.html(distributorNameOption).prepend(
					"<option value=''>Select</option>").val(that.filter.distId).select2();

		        if(that.filter.distId != "") {
		        	that.renderDistributorLocation();
					that.renderDistributorBranch();
		        }
			});
		},

		onChangeDistributor: function(evt) {
			var currentTarget = $(evt.currentTarget);

			if(this.$('.distributor_location').data("select2")){
				this.$('.distributor_location').select2("destroy").empty();
			}
			if(this.$('.distributor_branch').data("select2")){
				this.$('.distributor_branch').select2("destroy").empty();
			}
			
			this.filter["distId"] = currentTarget.val();
			this.filter["locationId"] = "";
			this.filter["branchId"] = "";

			this.renderDistributorLocation();
			this.renderDistributorBranch();
		},

		renderDistributorLocation: function() {
			var that = this;

			fetchLocations(db, {distId:this.filter.distId}, function(locations){
				
				var locationNameOption = Mustache.to_html(
					template.selectLocation, 
					{options:locations});

				var locationEle = that.$(".distributor_location");

				if(locationEle.data('select2')){
					locationEle.select2("destroy").empty();
				}

				locationEle.html(locationNameOption).prepend("<option value=''>Select</option>")
					.val(that.filter.locationId).select2();
			});
		},

		onChangeLocation: function(evt) {
			if(this.$('.distributor_branch').data("select2")){
				this.$('.distributor_branch').select2("destroy").empty();
			}

			this.filter["locationId"] = $(evt.currentTarget).val();
			this.filter["branchId"] = "";

			this.renderDistributorBranch();
		},

		renderDistributorBranch: function() {
			var that = this;

			var condition = {distId:this.filter.distId};

			if(this.filter.locationId) {
				condition["locationId"] = this.filter.locationId;
			}

			fetchBranches(db, condition, function(branches){
				var branchNameOption = Mustache.to_html(
					template.selectBranch, 
					{options:branches});

				var branchEle = that.$(".distributor_branch");

				branchEle.html(branchNameOption).prepend("<option value=''>Select</option>");			

				if(branchEle.data('select2')){
					branchEle.select2("destroy").empty();
				}
				branchEle.val(that.filter.branchId).select2();
			});
		},

		getFilterValues: function() {
			var distId = this.$('.distributor_name').val() || "";
			var locationId = this.$('.distributor_location').val() || "";
			var branchId = this.$('.distributor_branch').val() || "";

			var data = {
				"branchId" : branchId,
				"distId" : distId,
				"locationId" : locationId
			};

			return data;
		},

		logOut: function() {
		    inswit.confirm(inswit.alertMessages.logOut, function onConfirm(buttonIndex) {
		        if(buttonIndex == 1) {
		            inswit.sessionOut();
		        }
		    }, "confirm", ["OK", "Cancel"]);
		},

		renderFilterHeader: function() {
			var that = this;

			var distName, locationName, branchName;
			selectDistributor(db, that.filter, function(options){
				var filterObj = JSON.parse(LocalStorage.getAuditFilter());
				if(filterObj.distId) {
					distName = options[0].dbtr_name;
				}
				if(filterObj.locationId) {
					locationName = options[0].loc_name;
				}
				if(filterObj.branchId) {
					branchName = options[0].brch_name;
				}

				var filterValues = {
					"distName" : distName || "All distributor",
					"locationName" : locationName || "All Location",
					"branchName" : branchName || "All Branch"
				};

				var html = Mustache.to_html(template.displayFilterDetails, filterValues);
				that.$(".filter_container").html(html);

				that.$(".search").prop("disabled", false);

			});
		},

		searchAudit: function(e){
			var that = this;

			var searchKey = that.$el.find(".search").val();
			var perPage = this.model.get("perPage");
			var start = this.model.get("start");

			if(this.timer){
				clearTimeout(this.timer);
				this.timer = null;
			}

			this.timer = setTimeout(function(){
				try{
					that.fetchAudit(searchKey, true);
				}catch(err){
					inswit.alert(err.message);
				}
			}, 500);
		},

		back: function(){
			window.history.back();
		},

		fetchUpdatedMasterData: function(callback){
			var that = this;

			inswit.showLoaderEl("Updating data! Please wait...");

			var processVariables = {
			    "projectId":inswit.INIT_PROCESS.projectId,
			    "workflowId":inswit.INIT_PROCESS.workflowId,
			    "processId":inswit.INIT_PROCESS.processId,
			    "ProcessVariables":{
			    	"isUpdate":true,
			    	"date":LocalStorage.getLastUpdatedDate()
			    }
			};
			
			inswit.executeProcess(processVariables, {
			    success: function(response){
			    	if(response.ProcessVariables){
			    		var date = response.ProcessVariables.updatedDate;
			    		
			    		inswit.updateMasterData(response.ProcessVariables, function(){

			    			inswit.hideLoaderEl();
			    			LocalStorage.setLastUpdatedDate(date);
			    			callback();
			    		});
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

		getStoreName: function(mId){
			var that = this;

			fetchStoreName(db, mId, function(result){
				that.storeName = result.storeName;
			});
		},

		refreshScroll: function(wrapperEle) {
			if(!this.scrollView) {
				this.scrollView = new iScroll(wrapperEle);
			}
			this.scrollView.refresh();
		},

		removePartilAudit: function(mId, callback) {
		     var id = mId.split("-");
             var storeId = id[1];
             inswit.clearPartialAudit(storeId);
             callback();
		},

		forceClear: function() {

            inswit.confirm(inswit.alertMessages.forceLogout, function onConfirm(buttonIndex) {
                if(buttonIndex == 1) {
                    LocalStorage.removeEmployeeEmail();

                    LocalStorage.removeAccessToken();
                    LocalStorage.removeEmployeeId();
                    LocalStorage.resetAuditFilter();

                    router.navigate("/", {
                        trigger: true
                    });
                }
            }, "confirm", ["OK", "Cancel"]);

		},

		checkRemainingTime: function(mId, callback) {
            var that = this;
            var serverDateTime;
            var startedDateTime;

            var auditTimeLimit = LocalStorage.getAuditTimeLimit();

            serverDateTime = new Date(); // Current Date & Time

            startedDateTime = new Date(localStorage.getItem(mId));

            var diffTime = serverDateTime.getTime() - startedDateTime.getTime();
            if(diffTime < 0 ) {
                var id = mId.split("-");
                var storeId = id[1];
                inswit.clearPartialAudit(storeId);
                inswit.alert(inswit.ErrorMessages.invalidMobileTime);
                callback();
                return;
            }
            if(diffTime >= auditTimeLimit * 60 *1000) {
                var id = mId.split("-");
                var storeId = id[1];
                inswit.clearPartialAudit(storeId);
                callback();
            }else {
                //Go to products page
                var ele = $(".timer_container").show();
                var el = "timer";
                var remainingTime = ((auditTimeLimit* 60* 1000) - diffTime);

                var minutes = Math.floor(remainingTime / 60000);
                var seconds = ((remainingTime % 60000) / 1000).toFixed(0);
                seconds = (seconds < 10 ? '0' : '') + seconds;

                console.log("minutes"+ minutes);
                console.log("seconds"+ seconds);


                var id = mId.split("-");
                var storeId = id[1];
                inswit.setTimer(el, parseInt(minutes), parseInt(seconds), storeId);
                that.alreadyStarted = true;
                var route = "#audits/" + mId + "/products";
                router.navigate(route, {
                    trigger: true
                });
            }
            inswit.hideLoaderEl();

        }

	});
	
	return Audit;
});