define([],function(){
    var template =  '<div class="upload_container"><div class="audit_header">\
                        <div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>\
                        <div class="left_content">\
                            <div class="center_content bold font_18">{{name}}</div>\
                        </div>\
                    </div>\
                    <div class="scroll_parent audit_score" id="audit_score">\
                        <div class="scroll_ele">\
                            <div class="con_adt_header font_18 bold" style="margin-left:10px">Sign Off Photo :</div>\
                            <button class="btn take_signature_photo" href={{mId}}>\
                                <img class="ico_16" src="images/matrix_icons/take_photo_48.png">\
                                <i class="icon_photo"></i> Take Sign Off Photo\
                            </button>\
                            <div class="photo_block"></div>\
                            <button class="complete_audit btn btn-success" href={{mId}}>Complete Audit</button>\
                            </div>\
                        </div>\
                    </div>';
                   
    return template;
});