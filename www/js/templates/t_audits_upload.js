define([],function(){
    var template =  '<div  class="on_upload_audit">\
                        <div class="left_content">\
                            <div class="center_content bold font_18">{{name}}</div>\
                        </div>\
                    </div>\
                    <div class="details_container scroll_parent" id="audit_verify">\
                        <div class="scroll_ele">\
                            <img src="images/matrix_icons/waiting_48.png" class="ico_48 " align="middle">\
    						<div class="upload_title">Audit details for <br><b>{{name}} </b><br> is ready to be uploaded</div>\
                        	<div>\
                            	<button href="{{mId}}" class="btn btn-success upload_audit">Upload Now</button>\
                            	<a href="#audits" class="btn btn-success">Upload Later</a>\
                        	</div>\
                        </div>\
                    </div>';

    return template;
});