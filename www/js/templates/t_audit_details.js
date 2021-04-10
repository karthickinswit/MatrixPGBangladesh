define([],function(){
    var template =  '<div class="audit_header">\
                        <div class="back">\
                            <img src="images/matrix_icons/back_arrow_red_72.png" class="ico_36">\
                        </div>\
                        <div class="left_content header_border_left">\
                            <div class="center_content bold font_18">{{name}}</div>\
                        </div>\
                    </div>\
                    <div id="map">\
                        <div class="audit_header audit_home_header" style="text-align:center">\
                            <img src="images/map_bg_300.png" class="offline_map">\
                            <img src="images/map_error_48.png" class="map_error_icon">\
                            <div class="map_error_info">Loading location map...</div>\
                        </div>\
                    </div>\
                    <div id="wrapper_audit_details" class="scroll_parent audit_details">\
                        <div class="audit_info" class="scroll_ele">\
                            <table class="table">\
                                <tr>\
                                    <td><i class="aud_location"></i></td>\
                                    <td><b>Location</b></td>\
                                    <td> {{location}}</td>\
                                </tr>\
                                <tr>\
                                    <td><i class="aud_branch"></i></td>\
                                    <td><b>Branch Name</b></td>\
                                    <td> {{branchName}}</td>\
                                </tr>\
                                <tr>\
                                    <td><i class="aud_storecode"></i></td>\
                                    <td><b>Store Code</b></td>\
                                    <td> {{storeCode}}</td>\
                                </tr>\
                                <tr>\
                                    <td><i class="aud_storename"></i></td>\
                                    <td><b>Store Name</b></td>\
                                    <td> {{name}}</td>\
                                </tr>\
                                <tr>\
                                    <td><i class="aud_address"></i></td>\
                                    <td><b>Address</b></td>\
                                    <td> {{address}}</td>\
                                </tr>\
                                <tr>\
                                    <td><i class="aud_channel"></i></td>\
                                    <td><b>Channel</b></td>\
                                    <td> {{channelName}}</td>\
                                </tr>\
                                <tr>\
                                    <td><i class="aud_auditor"></i></td>\
                                    <td><b>Auditor Name</b></td>\
                                    <td> {{auditorName}}</td>\
                                </tr>\
                                <tr>\
                                    <td><i class="aud_auditorcode"></i></td>\
                                    <td><b>Auditor Code</b></td>\
                                    <td> {{auditorCode}}</td>\
                                </tr>\
                                <tr>\
                                    <td><i class="aud_date"></i></td>\
                                    <td><b>Date of Audit</b></td>\
                                    <td> {{date}}</td>\
                                </tr>\
                                <tr>\
                                    <td colspan="3">\
                                    <a href="#audits/{{mId}}/continue" id="{{id}}" class="start_audit btn btn-danger">Start Audit</a></td>\
                                </tr>\
                            </table>\
                        </div>\
                    </div>';

    return template;
});