define([],function(){
    var template =  '<div class="audit_header">\
                        <!--<div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>-->\
                        <div class="left_content">\
                            <div class="center_content bold font_18">{{name}}</div>\
                        </div>\
                    </div>\
                    <div id="continue_audit_wrapper" class="scroll_parent audit_continue">\
                        <div class="scroll_ele" style="padding:10px">\
                            <div class="con_adt_header font_18 bold">Store Photo :</div>\
                            <button class="btn take_store_photo">\
                                <img class="ico_16" src="images/matrix_icons/take_photo_48.png">\
                                <i class="icon_photo"></i> Take Store Photo\
                            </button>\
                            <div class="photo_block"></div>\
                            <div class="con_adt_header font_18 bold">Continue Audit :</div>\
                            <div class="con_adt_option font_18 bold">\
                                Yes<input type="radio" id="yes" name="confirmation" checked value=1 class="aud_confirmation">\
                                No<input type="radio" id="no" name="confirmation" value=0 class="aud_confirmation">\
                            </div>\
                            <div class="adt_status">\
                                <div class="audit_yes_block" style="display:none">\
                                    <div class="con_adt_status font_18 bold">Audit Status :</div>\
                                    <select class="audit_yes font_18 text_ellipsis" type="select">\
                                        {{#yesStoreOptions}}<option value={{status_id}}>{{status_name}}</option>{{/yesStoreOptions}}\
                                    </select>\
                                </div>\
                                <div class="audit_no_block" style="display:none">\
                                    <div class="con_adt_status font_18 bold">Audit Status :</div>\
                                    <select class="audit_no font_18 text_ellipsis" type="select">\
                                        {{#noStoreOptions}}<option value={{status_id}}>{{status_name}}</option>{{/noStoreOptions}}\
                                    </select>\
                                </div>\
                             </div>\
                            <button class="continue_audit btn btn-success" href="{{mId}}">Continue Audit</button>\
                            <button class="finish_audit btn btn-success" href="{{mId}}" style="display:none">Complete Audit</button>\
                        </div>\
                    </div>';
                   

    return template;
});