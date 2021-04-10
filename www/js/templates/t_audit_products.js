define([],function(){
    var template =  '<div class="audit_header">\
                        <!--<div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>-->\
                        <div class="left_content">\
                            <div class="center_content bold font_18">{{name}}</div>\
                        </div>\
                    </div>\
                    <div id="wrapper_products" class="scroll_parent products_list">\
                    <div class="scroll_ele">\
                        <ul class="products list-group">\
                            {{#products}}\
    	                        <a class="list-group-item product" href="#audits/{{mId}}/products/{{product_id}}" rel={{product_name}} id={{product_id}}>\
                                    {{#isHotSpot}}<i class="hotspot_ico ico_24"></i>{{/isHotSpot}}\
    	                            <span id={{product_id}}>\
                                    {{#done}}\
                                        <img src="images/matrix_icons/audit_completed_48.png" style="display:inline-block" class="ico_24">\
                                    {{/done}}\
                                    {{^done}}\
                                        <img src="images/matrix_icons/audit_completed_48.png" style="display:none" class="ico_24">\
                                    {{/done}}\
                                    {{product_name}} </span>\
    	                            <img src="images/matrix_icons/small_arrow_blue_48.png" class="ico_16 arrow_left">\
    	                        </a>\
                            {{/products}}\
                        </ul>\
                    <!-- <button href="#audits/{{mId}}/product/verify" class="btn btn-success verify_audit" disabled>Verify Audit</button>-->\
                    <!--<button href="{{mId}}" class="btn btn-success go_next">Continue</button>\
                    <button class="complete_audit btn btn-success" href={{mId}} disabled>Complete Audit</button>-->\
                    <button class="complete_audit btn btn-success" href={{mId}} disabled>Mark as Completed</button>\
                    <button class="restart_audit btn btn-success" href={{mId}}>Restart Again</button>\
                    </div>\
                    </div>';            
    return template;
});