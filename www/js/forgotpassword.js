define(['backbone','mustache','templates/t_forgot_password'], function(Backbone,Mustache,templates){
	
	var ForgotPassword = {};
	
	ForgotPassword.model = Backbone.Model.extend({

	});

	ForgotPassword.view = Backbone.View.extend({
		className: "cover forgotPassword",

		events: {
			"click #reset-btn" : "sendResetCode",
			"click .update_pass" : "updatePassword"
		},
		
		render: function() {
			var html = Mustache.to_html(
				templates.resetEmail, 
				this.model.toJSON()
			);
			this.$el.html(html);
		},

		sendResetCode: function(evt) {
			var that = this;

			var emailEle = $(evt.currentTarget)
				.parents(".control-group").find("input");
			var emailId = emailEle.val();

			var isValidEmail = this.validate(emailId, "email");

			var processVariables = {
				"projectId":inswit.FORGOT_PROCESS.projectId,
				"workflowId":inswit.FORGOT_PROCESS.workflowId,
				"processId":inswit.FORGOT_PROCESS.processId,
				"ProcessVariables":{"email": emailId}
			};

			if(!isValidEmail.status) {
				this.renderErrorMessage(emailEle, isValidEmail);
				return;
			}
			inswit.showLoaderEl("Sending reset code to email");

			inswit.loginInToAppiyo(function(){
				inswit.executeProcess(processVariables, {
					success: function(response){
						if(response.ProcessVariables.error == ""){

							LocalStorage.setResetPasswordDetails(
								response.ProcessVariables
							);

	               			that.showUpdatePasswordForm();
	                        inswit.hideLoaderEl();
						}else{

							inswit.alert(response.ProcessVariables.error);
							inswit.hideLoaderEl();
						}
					},
					failure: function(error){
						inswit.hideLoaderEl();
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
			});
		},

		showUpdatePasswordForm: function() {
			var html = Mustache.to_html(
				templates.setPassword, 
				this.model.toJSON()
			);
			this.$el.html(html);
		},

		updatePassword: function() {
			var empDetails = LocalStorage.getResetPasswordDetails();
			var email = empDetails.email;

			var resetCodeEle = this.$(".reset_code input");
			var resetCode = resetCodeEle.val();
			var isResetCodeValid = this.validate(resetCode, "resetcode");

			var passwordEle = this.$(".user_password input");
			var password = passwordEle.val();

			var confirmPasswordEle = this.$(".confirm_password input");
			var confirmPassword = confirmPasswordEle.val();

			var isPasswordValid = this.validate(password, "password");
			var isConfirmPasswordValid = this.validate(confirmPassword, "password");

			if(!isResetCodeValid.status) {
				this.renderErrorMessage(
					resetCodeEle, 
					isResetCodeValid
				);
				return;
			}

			if(!isPasswordValid.status) {
				this.renderErrorMessage(
					passwordEle, 
					isPasswordValid
				);
				return;
			}

			if(!isConfirmPasswordValid.status) {
				this.renderErrorMessage(
					confirmPasswordEle, 
					isConfirmPasswordValid
				);
				return;
			}

			if((password != confirmPassword)) {
				this.renderErrorMessage(
					confirmPasswordEle, 
					{error: "Password does not match."}
				);
				return;
			}

			inswit.showLoaderEl("Updating password details");


			var data = {
				"email" : email,
				"newPassword" : password
			};

			this.update(data);

		},

		update: function(data) {
			var processVariables = {
				"projectId":inswit.RESET_PROCESS.projectId,
				"workflowId":inswit.RESET_PROCESS.workflowId,
				"processId":inswit.RESET_PROCESS.processId,
				"ProcessVariables": data
			};

			inswit.executeProcess(processVariables, {
				success: function(response){
					if(response.Error == 0){
						inswit.alert("Your password details has been successfully updated");
						LocalStorage.setResetPasswordDetails({});
            			
            			router.navigate("#", {
                            trigger: true
                        });
                        inswit.hideLoaderEl();

					}else{
						inswit.alert("Check you username and password!");
					}
				},
				failure: function(error){
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
					} else {
						error = "Please Enter Valid Email Address";
					}

					data["status"] = regex.test(source);
					data["error"] = error;
					
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

		renderErrorMessage: function(ele, errorObj) {
			this.$(".error").removeClass("error");
			this.$(".error_message").remove();
			ele.parent().addClass("error");
			
			ele.after(Mustache.to_html(templates.errorMessage, errorObj));
		}
	});
	
	return ForgotPassword;
});