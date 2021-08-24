define([
	"backbone", 
	"mustache",
	"templates/t_register"
], function(Backbone, Mustache, template) {
	var Register = {};
	Register.Model = Backbone.Model.extend({
		
		initialize: function () { 

	    }                                
	});

	Register.View = Backbone.View.extend({

		className: "loginpage cover home_bg",
		
		initialize: function(){
			this.template = template;
		},
		
		events:{
			"click #register-btn" : "register"
		},

        render: function() {
            var that = this;
            var html ;
            // cordova.plugins.IMEI(function (err, imei) {
            //     console.log('imei', imei);
            //     that.model.set("imei", imei);
			// });
			this.uuid = device.uuid;
			html = Mustache.to_html(that.template, {"uuid": this.uuid});
			that.$el.html(html);


			return that;
		},

		register: function(){
			var that = this;

			var userName = this.$el.find("#name").val().trim();
			var uuid = this.uuid;
			//uuid='abcd12345';

			var isValidEmail = this.validate(userName, "email");

			var processVariables = {
				"projectId":inswit.REGISTER_PROCESS.projectId,
				"workflowId":inswit.REGISTER_PROCESS.workflowId,
				"processId":inswit.REGISTER_PROCESS.processId,
				"ProcessVariables":{"email_id": userName, "UUID": uuid}
			};

			if(!isValidEmail.status) {
				inswit.alert(isValidEmail.error);
				return;
			}
			inswit.showLoaderEl("Registering please wait....");

			inswit.loginInToAppiyo(function(){
				inswit.executeProcess(processVariables, {
					success: function(response){
						if(response.ProcessVariables.status){
							inswit.alert(response.ProcessVariables.message);
	                        inswit.hideLoaderEl();
						}else{
							inswit.alert(response.ProcessVariables.message);
							inswit.hideLoaderEl();
						}
					},
					failure: function(error){
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
	                			inswit.alert("Login Failed.Try Again!");
	                			break;
	                		}
	                	}
					} 
				});
			});

		},

		validate: function(source, type){
			var error, regex = /\S+@\S+\.\S+/, data = {};

			switch(type){
				case "password":{
					
					data["status"] = true;
					if(source == ""){
						error = "Field Should not be empty";
						data["status"] = false;
					}else if(source.length < 8) {
						error = "Password must be minimum 8 characters";
						data["status"] = false;
					}
					
					data["error"] = error;

					break;
				}
				case "email":{
					
					if(source == ""){
						error = "Email Address Should not be empty";
						data["status"] = false;
						data["error"] = error;
					}else {
						data["status"] = true;
					}
					// else {
					// 	error = "Please Enter Valid Email Address";
					// }
					
					
					break;
				}
				case "resetcode":{

					var resetCode = LocalStorage.getResetPasswordDetails().resetCode;
					
					if(source == "") {
						error = "Reset code should not be empty";
					}else {
						error = "Invalid reset code"
					}
					data["status"] = (source == resetCode);
					data["error"] = error;
					
					break;
				}
			}

			return data;
		},



    });

    return Register;
});