define([],function(){
    var template =  '<div class="audit_header">\
                        <div class="back" style="z-index: 10000;">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>\
                        <div class="left_content header_border_left">\
                            <div class="center_content bold font_18">{{name}}</div>\
                        </div>\
                    </div>\
                    <div class="product_header"><h2 class="font_16" id={{productId}}>{{productName}}</h2></div>\
                    <div class="scroll_parent question_list" id="wrapper_norms">\
                        <div class="norms scroll_ele" href={{priority}} rel={{takePhoto}}>\
                            <button class="btn non_execution_btn">\
                                <span>\
                                    <label class="checbox_label" for="non_exec">\
                                        <input type="checkbox" name="tester" class="execution_checkbox" id="non_exec" value="Test1"  {{#isImage}} disabled {{/isImage}} {{#nonExecution}} checked {{/nonExecution}} >\
                                        <span class="non_brand_txt"> Device Not executed </span>\
                                    </label>\
                                </span>\
                            </button>\
                            {{#norms}}\
                                {{#photoBox}}\
                                    <div class="question" rel={{isConsider}} id=-1 data-field-type="photobox">\
                                         <div class="product_name" id="{{normId}}" rel="{{normName}}">{{question}}</div>\
                                         <div class="error_message">*Field is required</div>\
                                        {{#photoBox}}\
                                            {{#takePhoto}}\
                                                <button class="btn take_product_photo" id="{{normId}}" {{#nonExecution}} disabled {{/nonExecution}}>\
                                                    <img class="ico_16" src="images/matrix_icons/take_photo_48.png">\
                                                    <i class="icon_photo"></i> Take Brand Photo\
                                                </button>\
                                            {{/takePhoto}}\
                                            <div class="photo_block" id="{{normId}}">\
                                                {{#isImage}}\
                                                    <img src="{{imageURI}}" width="95%" height="200px" style="margin-left:2.5%">\
                                                    <a class="retake_photo {{element}}">Retake</a>\
                                                {{/isImage}}\
                                            </div>\
                                        {{/photoBox}}\
                                    </div>\
                                {{/photoBox}}\
                            {{/norms}}\
                            <!--{{#takePhoto}}\
                                <button class="btn take_product_photo">\
                                    <img class="ico_16" src="images/matrix_icons/take_photo_48.png">\
                                    <i class="icon_photo"></i> Take Brand Photo\
                                </button>\
                            {{/takePhoto}}\
                            <div class="photo_block">\
                                {{#isImage}}\
                                    <img src="{{imageURI}}" width="95%" height="200px" style="margin-left:2.5%">\
                                    <a class="retake_photo {{element}}">Retake</a>\
                                {{/isImage}}\
                            </div>-->\
                            <button href={{mId}} class="product_done btn btn-success">Done</button>\
                        </div>\
                    </div>';

    return template;
});