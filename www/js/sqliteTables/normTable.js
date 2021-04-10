/*************************** Create All Enterprise Table in DB if not exist*****************************************/

function createNorm(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_norm(norm_id TEXT, norm_name TEXT, option_id TEXT, remark_id TEXT, field_type TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX allNormIndex ON mxpg_norm(norm_id, option_id, remark_id)";
    tx.executeSql(createIndex);
    
}

function createOption(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_option(option_id TEXT, option_name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX allOptionIndex ON mxpg_option(option_id)";
    tx.executeSql(createIndex);
}

function createRemark(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_remark(remark_id TEXT, remark_name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX allRemarkIndex ON mxpg_remark(remark_id)";
    tx.executeSql(createIndex);
}

/**
 * This method Insert or Replace the record in the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateNormTable(db, norms, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < norms.length; i++){
            var norm = norms[i];
            tx.executeSql('INSERT OR replace INTO mxpg_norm(norm_id, norm_name, option_id, remark_id, field_type) VALUES (?,?,?,?,?);',
                [norm.normId, norm.normName, norm.optionId, norm.remarkId, norm.normType || inswit.FIELD_TYPES.PHOTO]
            , success, error);
        }
    });
}

/**
 * This method Insert or Replace the record in the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateOptionTable(db, options, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < options.length; i++){
            var option = options[i];
            tx.executeSql('INSERT OR replace INTO mxpg_option(option_id, option_name) VALUES (?,?);',
                [option.id, option.name]
            , success, error);
        }
    });
}

/**
 * This method Insert or Replace the record in the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateRemarkTable(db, remarks, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < remarks.length; i++){
            var remark = remarks[i];
            tx.executeSql('INSERT OR replace INTO mxpg_remark(remark_id, remark_name) VALUES (?,?);',
                [remark.id, remark.name]
            , success, error);
        }
       
    });
}

/**
 * This method Select the record from the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 */

function selectNorms(db, channelId, productId, priority, isFrontage, fn) {

    var query = "select t1.norm_id, t1.store_score, t1.norm_order, t2.norm_name, t2.field_type from mxpg_pn_map t1 JOIN mxpg_norm t2 where t1.product_id=" + productId + " and t1.channel_id=" + channelId + " and t1.norm_id=t2.norm_id order by t1.norm_order ASC";
    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            var results = [];
            var len = response.rows.length;

            var index = 1;
            for(var i = 0; i < len; i++){
                var row = response.rows.item(i);

                var temp = {};
                temp.question = index + ". " + row.norm_name;
                temp.normName = row.norm_name;
                temp.normId = row.norm_id;
                temp.isConsider = row.store_score == "true" ? true:false;
                temp.show1 = "block";
                temp.show2 = "none";
                temp.options = [];
                temp.yes = [];
                temp.no = [];


                if(row.field_type == inswit.FIELD_TYPES.INT) {
                    temp.textBox = true;
                    temp.typeINT = true;
                    temp.options.push({"optionName":row.givenValue, "optionId":row.option_id});
                }else if(row.field_type == inswit.FIELD_TYPES.TEXT) {
                    temp.textBox = true;
                    temp.typeTEXT = true;
                    temp.options.push({"optionName":row.givenValue, "optionId":row.option_id});
                }else if(row.field_type == inswit.FIELD_TYPES.OPTION) {

                    temp.selectBox = true;
                    var optionName = row.option_name.toLowerCase().trim();
                    if(optionName == "yes"){
                        temp.options.push({"optionName":row.option_name, "optionId":row.option_id});
                        temp.yes.push({"remarkName":row.remark_name, "remarkId":row.remark_id});
                    }else if(optionName == "no"){
                        temp.options.push({"optionName":row.option_name, "optionId":row.option_id});
                        if(row.remark_id == 44){
                            if(priority == 8 || priority == 10){
                                temp.no.push({"remarkName":row.remark_name, "remarkId":row.remark_id});
                            }
                        }else if(row.remark_id == 50){
                            if(priority == 6 && isFrontage == "false"){
                                temp.no.push({"remarkName":row.remark_name, "remarkId":row.remark_id});
                            }
                        }else{
                           temp.no.push({"remarkName":row.remark_name, "remarkId":row.remark_id});
                        }
                    }
                 }else if(row.field_type == inswit.FIELD_TYPES.PHOTO) {
                    temp.photoBox = true;
                    temp.takePhoto = true;
                 }

                if(i == len - 1){
                    results.push(temp);
                    break;
                }
                
                for(var j = i+1; j < len; j++){
                    
                    var nextRow = response.rows.item(j);
                    if(row.norm_id == nextRow.norm_id){
                        var nextOptionName = nextRow.option_name.toLowerCase().trim();

                        if(nextOptionName == "yes"){
                            for(var k = 0; k < temp.options.length; k++){
                                if(temp.options[k].optionName.toLowerCase().trim() == "yes"){
                                    break;
                                }

                                if(k == temp.options.length - 1){
                                    temp.options.push({"optionName":nextRow.option_name, "optionId":nextRow.option_id});
                                    break;
                                }
                            }
                        
                            temp.yes.push({"remarkName":nextRow.remark_name, "remarkId":nextRow.remark_id});
                        }else if(nextOptionName == "no"){
                            for(var k = 0; k < temp.options.length; k++){
                                if(temp.options[k].optionName.toLowerCase().trim() == "no"){
                                    break;
                                }

                                if(k == temp.options.length - 1){
                                    temp.options.push({"optionName":nextRow.option_name, "optionId":nextRow.option_id});
                                    break;
                                }
                            }

                            if(nextRow.remark_id == 44){
                                if(priority == 8 || priority == 10){
                                    temp.no.push({"remarkName":nextRow.remark_name, "remarkId":nextRow.remark_id});
                                }
                            }else if(nextRow.remark_id == 50){
                                if(priority == 6 && isFrontage == "false"){
                                    temp.no.push({"remarkName":nextRow.remark_name, "remarkId":nextRow.remark_id});
                                }
                            }else{
                               temp.no.push({"remarkName":nextRow.remark_name, "remarkId":nextRow.remark_id});
                            }
                        }
                    }else{
                        results.push(temp);
                        i = j-1;
                        break;
                    }

                    if(j == len-1){
                        results.push(temp);
                        i = j;
                        break;
                    }
                }

                index++;
            }
            
            fn(results);
        });
    });
}
