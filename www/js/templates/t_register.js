define([],function(){
    var template = '<div class="container">\
    <div class="content">\
        <div id="login-form" class="form-horizontal register-screen" >\
          <div class="control-group ">\
            <div class="user_name">\
              <input type="text" id="name" name="name"  class="width_90p input-xlarge" placeholder="Enter your user name *">\
            </div>\
            <div class="uuid_container">\
              <span class="unique_text">Unique device ID:</span>\
              <span class="uuid_txt">{{uuid}}</span>\
            </div>\
          <div class="control-group-login">\
            <div id="register-btn" class="btn btn-primary width_90p">Register</div>\
          </div>\
        </div>\
      </div>\
  </div>';
  
  return template;
  });
  