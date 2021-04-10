
function createStoreStatus(tx, success, error){
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_store_status(status_id INTEGER, status_name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX storeStatusIndex ON mxpg_store_status(status_id)";
    tx.executeSql(createIndex);
}

function createChannelTable(tx, success, error){
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_channel(channel_id INTEGER, channel_name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX channelIndex ON mxpg_channel(channel_id)";
    tx.executeSql(createIndex);
}

function createDistBranchLocationTable(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_dist_brch_loc(dbtr_id INTEGER, dbtr_name TEXT, brch_id INTEGER, brch_name TEXT, loc_id INTEGER, loc_name TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX distBrchLocIndex ON mxpg_dist_brch_loc(dbtr_id, brch_id, loc_id)";
    tx.executeSql(createIndex);
}

function populateStoreStatusTable(db, storeOptions, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < storeOptions.length; i++){
            var option = storeOptions[i];

            tx.executeSql('INSERT OR replace INTO mxpg_store_status(status_id, status_name) VALUES (?,?);',
            [option.id, option.name], success, error);
        }
    });
}

function populateChannelTable(db, channels, success, error) {
    db.transaction(function(tx){
        for(var i = 0; i < channels.length; i++){
            var channel = channels[i];

            tx.executeSql('INSERT OR replace INTO mxpg_channel(channel_id, channel_name) VALUES (?,?);',
            [channel.id, channel.name], success, error);
        }
    });
}

function populateDistBranchLocationTable(db, mapDeatils, success, error) {
    db.transaction(function(tx){

        for(var i = 0; i < mapDeatils.length; i++){
            var data = mapDeatils[i];
            tx.executeSql('INSERT OR replace INTO mxpg_dist_brch_loc(dbtr_id, dbtr_name, brch_id, brch_name, loc_id, loc_name) VALUES (?,?,?,?,?,?);',
                [data.distId, data.distName, data.branchId, data.branchName, data.locId, data.locName]
            , success, error);
        }
    });
}

function selectDistributor(db, details, fn) {
    var query = "select * from mxpg_dist_brch_loc";
    var temp = [];
    if(details && details.distId){
        temp.push("dbtr_id='" + details.distId + "' ");
    }
    if(details && details.branchId){
        temp.push("brch_id='" + details.branchId + "' ");
    }
    if(details && details.locationId){
        temp.push("loc_id='" + details.locationId + "' ");
    }

    var length = temp.length;
    if(length > 0){
        query += " WHERE ";
    }

    for(var i = 0; i < length; i++){
        if(i+1 != length){
            query += temp[i] + " AND ";
        }else{
            query += temp[i];
        }
    }
    
    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            var results = [];
            var len = response.rows.length;

            for(var i = 0; i < len; i++){
                var obj = response.rows.item(i);
                results.push(obj);
            }
            
            fn(results);
        });
    });
}

function selectStoreStatus(db, fn) {
    var query = "select * from mxpg_store_status";
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx,response) {
            fn(response.rows);
        }, function(tx,error){
            console.log(error);
        });
    });
}

function selectChannels(db, fn) {
    var query = "select * from mxpg_channel order by channel_id asc";
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx,response) {
            fn(response.rows);
        }, function(tx,error){
            console.log(error);
        });
    });
}

function clearData(db, callback, error){
    var query = "SELECT name FROM sqlite_master WHERE type='table'";

    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, response) {
            if(response.rows && response.rows.length > 0){
                var len = response.rows.length;

                for(var i = 0; i < len; i++){
                    var tableName = response.rows.item(i).name;
                    if(tableName.indexOf(inswit.DB) >= 0) {
                    	console.log("Dropping table: " + tableName);
                    	var q = "DROP TABLE IF EXISTS " + tableName + ";";
                        tx.executeSql(q, [], function(){}, function(){});
                    }else {
                    	console.log("Skipping table: " + tableName);
                    }

                    if(i == len - 1){
                        callback();
                    }
                }
            }
        });
    });
}

function removeTable(db, tableName, callback, error){
    var query = "DELETE FROM " + tableName + ";";

    db.transaction(function(tx){
        tx.executeSql(query , [], callback, error);
    });
}



function getStoreCode(db, storeId, callback, error){
    var query = "SELECT store_code FROM mxpg_store WHERE store_id = ?;";

    db.transaction(function(tx){
        tx.executeSql(query, [storeId], function(tx, response){
            if(response.rows && response.rows.length > 0){
                var storeCode = response.rows.item(0).store_code;
                callback(storeCode);
            }
        }, function(a, e){
           
        });
    });
}

function getDistributor(db, auditId, storeId, callback, error){
    
    var query = "SELECT dbtr_id FROM mxpg_store WHERE audit_id = ? AND store_id = ?;";

    db.transaction(function(tx){
        tx.executeSql(query, [auditId, storeId], function(tx, response){
            if(response.rows && response.rows.length > 0){
                var dbtr_id = response.rows.item(0).dbtr_id;
                callback(dbtr_id);
            }
        }, function(a, e){
           
        });
    });
}

function removeAuditEntries(db, auditId, storeId, success, error) {

    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_audits WHERE store_id=? AND audit_id=?;', [storeId, auditId]);
    });

    db.transaction(function(tx){
        tx.executeSql('DELETE FROM mxpg_comp_products WHERE store_id=? AND audit_id=?;', [storeId, auditId]);
    });
}

function removeAuditHistories(db, auditId, storeId, success, error){

    var query = "DELETE FROM mxpg_audit_history WHERE audit_id='" + auditId + "' AND store_id='" + storeId + "';";

    db.transaction(function(tx){
        tx.executeSql(query);
    });
}