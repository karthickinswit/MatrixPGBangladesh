define([],function(){
    var template =  '<div class="audit_header" id={{storeId}} rel={{auditId}}>\
                        <div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>\
                        <div class="left_content">\
                            <div class="center_content bold font_18">{{name}}</div>\
                        </div>\
                    </div>\
                    <div class="details_container scroll_parent" id="audit_verify">\
                        <div class="scroll_ele">\
                            {{#products}}\
                                <ol class="v_products">\
                                    <div class="p_header font_14" id={{productId}}><b>{{productName}}</b>\
                                        <a href=#audits/{{mId}}/products/{{productId}} class="edit" rel={{productName}}>\
                                            <i class="edit_audit ico_32"></i>\
                                        </a>\
                                    </div>\
                                    {{#norms}}\
                                        <li class="question" style="margin:10px">\
                                            <div class="normName" id={{normId}}><b>{{normName}}</b></div>\
                                             <div class="photo_block" id="{{normId}}">\
                                                {{#isImage}}\
                                                    <img src="{{imageURI}}" width="95%" height="200px" style="margin-left:2.5%">\
                                                {{/isImage}}\
                                            </div>\
                                        </li>\
                                    {{/norms}}\
                                    <!-- <div class="photo_block">\
                                        {{#isImage}}\
                                            <img src="{{imageURI}}" id="{{image}}" width="95%" height="200" style="margin-left:2.5%">\
                                        {{/isImage}}\
                                    </div> -->\
                                </ol>\
                            {{/products}}\
                            <button href="{{mId}}" class="btn btn-success go_next">Continue</button>\
                        </div>\
                    </div>';

    return template;
});