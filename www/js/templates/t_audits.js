define([],function(){
    var templates = {};

    templates.auditMain =  '{{#audits}}\
                                <div class="audit {{mId}}" href={{mId}} style=background:{{auditColor}}>\
                                    <span class="audit_channel_status">\
                                        <div class="color_code" style=background:{{color}}>{{channelCode}}</div>\
                                        {{#partial}}\
                                            <img src="images/matrix_icons/audit_icon_48.png" class="ico_32 status_ico">\
                                        {{/partial}}\
            							{{#completed}}\
                                            <img src="images/matrix_icons/audit_pending_48.png" class="ico_32 status_ico">\
                                        {{/completed}}\
                                        {{#normal}}\
                                            <img src="images/matrix_icons/audit_icon_48.png" class="ico_32 status_ico">\
                                        {{/normal}}\
                                    </span>\
                                    <span class="resource_content">\
                                        <span class="font_18 name text_ellipsis" title="{{name}}">\
                                            {{name}}\
                                        </span>\
                                        <span class="store_code text_ellipsis">\
                                            <img src="images/matrix_icons/store_code.png" class="ico_12">\
                                            <i class="font_12">Store &nbsp&nbsp</i>:\
                                            <span class="font_14 ellipsis" title="{{storeCode}}">{{ storeCode}}</span>\
                                        </span>\
                                        <span class="assigned_date">\
                                            <img src="images/matrix_icons/date_audit.png" class="ico_12">\
                                            <i class="font_12">Due  &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</i>:\
                                            <span class="font_14 ellipsis" title="{{endDate}}">{{ endDate}}</span>\
                                        </span>\
                                    </span>\
                                    <span class="left_arrow" style="display:inline-block">\
                                        {{#audited}}\
                                            <img src="images/matrix_icons/ok_green_48.png" class="ico_32">\
                                        {{/audited}}\
                                        <img src="images/matrix_icons/back_arrow_blue_72.png" class="ico_32">\
                                    </span>\
                                </div>\
                            {{/audits}}';

    templates.compAudit =  '<div class="audit_header">\
                                <div class="back">\
                                    <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                                </div>\
                                <div class="left_content">\
                                    <div class="center_content bold font_18">Completed Audits</div>\
                                </div>\
                            </div>\
                            <div id="upload_audit_wrapper" class="scroll_parent upload_audits">\
                            {{#audits}}\
                                <div class="audit" href={{mId}}>\
                                    <img src="images/matrix_icons/audit_pending_48.png" class="ico_32 status_ico">\
                                    <div class="resource_content">\
                                        <span class="font_18 name text_ellipsis" title="{{store_name}}">\
                                            {{store_name}}\
                                        </span>\
                                        <span class="store_code text_ellipsis">\
                                            <img src="images/matrix_icons/store_code.png" class="ico_12">\
                                            <i class="font_12">Store &nbsp&nbsp</i>:\
                                            <span class="font_14 ellipsis" title="{{store_code}}">{{ store_code}}</span>\
                                        </span>\
                                        <span class="assigned_date">\
                                            <img src="images/matrix_icons/date_audit.png" class="ico_12">\
                                            <i class="font_12">Due  &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</i>:\
                                            <span class="font_14 ellipsis" title="{{due}}">{{ due}}</span>\
                                        </span>\
                                    </div>\
                                    <span class="left_arrow" style="display:inline-block">\
                                        <img src="images/matrix_icons/back_arrow_blue_72.png" class="ico_32">\
                                    </span>\
                                </div>\
                            {{/audits}}\
                            <button class="upload_all btn btn-success" id="upload_all">Upload All</button>';
    
    templates.filterModal = '<div id="myModal" class="modal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
                            <div class="modal-dialog">\
                                <div class="modal-header">\
                                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="modal_close ico_16"></i></button>\
                                    <h4>Filter Audits List</h4>\
                                </div>\
                                <div class="modal-body">\
                                    <div class="panel panel-default">\
                                            <div class="panel-body">\
                                                <form>\
                                                    <div class="form-group">\
                                                        <label class="filter-col" style="margin-right:0;" for="pref-perpage">Distributor Name:</label>\
                                                        <select id="pref-perpage" class="form-control distributor_name">\
                                                        </select>\
                                                    </div>\
                                                    <div class="form-group">\
                                                        <label class="filter-col" style="margin-right:0;" for="pref-search">Distributor Location:</label>\
                                                        <select id="pref-perpage" class="form-control distributor_location">\
                                                        </select>\
                                                    </div>\
                                                    <div class="form-group">\
                                                        <label class="filter-col" style="margin-right:0;" for="pref-search">Distributor Branch:</label>\
                                                        <select id="pref-perpage" class="form-control distributor_branch">\
                                                        </select>\
                                                    </div>\
                                                    <div class="row">\
                                                        <div class="col-xs-6">\
                                                            <div class="btn btn-success submit_filter filter-col">\
                                                                Save Filter\
                                                            </div>\
                                                        </div>\
                                                        <div class="col-xs-6">\
                                                            <div class="btn btn-warning reset_filter">Reset</div>\
                                                        </div>\
                                                    </div>\
                                                </form>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>';
        templates.selectOptions = '{{#option}}<option value="{{.}}">{{.}}</option>{{/option}}';

        templates.selectDistributor = '{{#options}}<option value="{{dbtr_id}}">{{dbtr_name}}</option>{{/options}}';

        templates.selectLocation = '{{#options}}<option value="{{loc_id}}">{{loc_name}}</option>{{/options}}';

        templates.selectBranch = '{{#options}}<option value="{{brch_id}}">{{brch_name}}</option>{{/options}}';

        templates.displayFilterDetails = '<ul class="filterValues">\
                        <li class="dis_filter ellipsis">{{distName}}</li>\
                        <li class="loc_filter ellipsis">{{locationName}}</li>\
                        <li class="branch_filter ellipsis">{{branchName}}</li>\
                    </ul>';

        templates.emptyCompAudit =  '<div class="audit_header">\
            <div class="back">\
                <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
            </div>\
            <div class="left_content">\
                <div class="center_content bold font_18">Completed Audits</div>\
            </div>\
        </div>\
        <div class="no_audit">Nothing is ready to upload</div>';


    return templates;
});