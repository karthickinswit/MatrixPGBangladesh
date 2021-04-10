define([], function(){
	var templates = {};

	templates.resetEmail = '<div class="">\
		<div class="audit_header audit_home_header">\
			<img src="images/logo.png" class="logo ico_48 pull-left">\
			<div class="left_content">\
				<div class="center_content font_18">Reset Password</div>\
			</div>\
		</div>\
		<div class="container">\
		 	<div class="content">\
		      <div id="reset-form" class="form-horizontal register-screen" >\
		        <div class="control-group">\
			        <h5 class="font_18">Please enter your email id</h5>\
		          <div class="reset_email for_box">\
		            <input type="text" id="name" name="name"  class="width_100p input-xlarge" placeholder="Please enter your email id *" value="">\
		          </div>\
		        <div class="control-group-reset">\
		          <div id="reset-btn" class="btn btn-primary width_100p">Reset Password</div>\
		        </div>\
		      </div>\
		    </div>\
		</div>\
	</div>';

	templates.setPassword = '<div class="">\
		<div class="audit_header audit_home_header">\
			<img src="images/logo.png" class="logo ico_48 pull-left">\
			<div class="left_content">\
				<div class="center_content font_18">Update Password</div>\
			</div>\
		</div>\
		<div class="container">\
		  <div class="content">\
		      <div id="reset-form" class="form-horizontal enterpass-screen" >\
		        <div class="control-group">\
		        	<h4>Reset code has been sent to registered email id. Please enter the reset code and password</h4>\
		          <div class="reset_code for_box">\
		            <input type="text" id="resetCode" name="resetCode"  class="width_100p input-xlarge" placeholder="Enter Reset code here *" value="">\
		          </div>\
		          <div class="user_password for_box">\
		            <input type="password" id="password" name="password"  class="width_100p input-xlarge" placeholder="Enter Password *" value="">\
		          </div>\
		          <div class="confirm_password for_box">\
		            <input type="password" id="password" name="confirmPassword"  class="width_100p input-xlarge" placeholder="Enter Confirm Password *" value="">\
		          </div>\
		        <div class="control-group-reset">\
		          <div id="updatepass-btn" class="update_pass btn btn-primary width_100p">Update Password</div>\
		        </div>\
		      </div>\
		    </div>\
		</div>\
	</div>';

	templates.errorMessage = '<div class="error_message">{{error}}</div>';

	return templates;
});