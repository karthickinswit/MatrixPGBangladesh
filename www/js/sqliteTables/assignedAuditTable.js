
function createAllStoreTable(tx, success, error) {
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_store(audit_id TEXT, store_id TEXT, id TEXT, store_code TEXT, store_name TEXT, mkt_id INTEGER, mkt_name TEXT, chl_id INTEGER, chl_name TEXT, dbtr_id INTEGER, dbtr_name TEXT, loc_id INTEGER, loc_name TEXT, brch_id INTEGER, brch_name TEXT, adtr_id NUMBER, adtr_name TEXT, adtr_code TEXT, addr TEXT, due TEXT, lat TEXT, lng TEXT,is_fresh BOOLEAN)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX allStoreIndex ON mxpg_store(store_id)";
    tx.executeSql(createIndex);
}

/**
 * This method Insert or Replace the record in the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 * @param  {function} callback function
 */

function populateAllStoreTable(db, storesDetails, callback, error) {
    var obj = "";

    var auditId = storesDetails.auditId;
    var empCode = storesDetails.empCodeByMx;
    var empId = storesDetails.empId;
    var empName = storesDetails.empName;
    var due = storesDetails.endDate;
    var startDate = storesDetails.startDate;

    var stores = storesDetails.stores;
    var length = stores.length;

    db.transaction(function(tx){
        for(var i = 0; i < length; i++){
            var store = stores[i];
                var latitude = "";
                var longitude = "";
                
                if(store.latitude != null &&  store.latitude != "" && store.latitude != "undefined"){
                    latitude = store.latitude;
                    longitude = store.longitude;
                }

            tx.executeSql('INSERT OR replace INTO mxpg_store(audit_id, store_id, id, store_code, store_name, mkt_id, mkt_name, chl_id, chl_name, dbtr_id, dbtr_name, loc_id, loc_name, brch_id, brch_name, adtr_id, adtr_name, adtr_code, addr, due, lat, lng, is_fresh) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
                [auditId, store.sId, store.id, store.sCodeByMx, store.sName, store.mktId, store.mktName, store.chanId, store.chanName, store.distId, store.distName, store.locId, store.locName, store.mxBrchId, store.mxBrchName, empId, empName, empCode, store.sAdds, due, latitude, longitude, store.isFreshAudit], function(tx, results){

                }, function(a, e){
                    console.log(e);
                });
        }

        callback();
    });
}

/**
 * This method Select the record from the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 */

function selectAllStores(db, search, filters, fn) {

    var searchText = (search == undefined) ? "" : search;

    var query = "select store_id as id, store_name as name, mkt_id as marketId, chl_id as channelId, due as endDate, store_code as storeCode, audit_id as auditId, is_fresh from mxpg_store where (store_name like "+ '\'%' + searchText + '%' +"'\ OR store_code like " + '\'%' + searchText + '%' + "\')";
    var temp = [];
    
    if(filters.distId){
        temp.push("dbtr_id='" + filters.distId + "' ");
    }
    if(filters.locationId){
       temp.push("loc_id='" + filters.locationId + "' ");
    }
    if(filters.branchId){
        temp.push(" brch_id='" + filters.branchId + "' ");
    }

    var length = temp.length;
    for(var i = 0; i < length; i++){
        query += " AND " + temp[i];
    }

    query += " ORDER BY datetime(due) DESC, store_name ASC";

    db.transaction(function(tx){
        tx.executeSql(query , [], function(tx, results) {
            var resultsArr = [];
            var len = results.rows.length;

            for(var i = 0; i < len; i++){
                var obj = results.rows.item(i);
                obj.mId = obj.auditId + "-" + obj.id + "-" + obj.channelId;
                obj.due_date = obj.endDate.split("T")[0];
                resultsArr.push(obj);
            }
            
            fn(resultsArr);
        });
    });
}

/**
 * This method Select the record from the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 */

function findStore(db, auditId, storeId, fn) {

    var select_query = "select * from mxpg_store where audit_id='" + auditId + "'AND store_id='" + storeId + "'";
    db.transaction(function(tx){
        tx.executeSql(select_query , [], function(tx, results) {
            var audit = "";
            if(results.rows.length > 0){
                audit = results.rows.item(0);
                audit.mId = audit.audit_id + "-" + audit.store_id + "-" + audit.chl_id;
                audit.due = audit.due.split("T")[0];
                fn(audit);
            }else{
                fn(audit);
            }
        });
    });
}

/**
 * This method Select the record from the All Store table in SQLite DB.
 * @param  {object} db
 * @param  {json} store
 */

function fetchStoreName(db, mId, fn) {
    var id = mId.split("-");
    var auditId = id[0];
    var storeId = id[1];
    var channelId = id[2];

    var select_query = "select store_name as storeName from mxpg_store where audit_id='" + auditId + "'AND store_id='" + storeId + "'";
    db.transaction(function(tx){
        tx.executeSql(select_query , [], function(tx, results) {
            var audit = "";
            if(results.rows.length > 0){
                audit = results.rows.item(0);
                fn(audit);
            }else{
                fn(audit);
            }
        });
    });
}

/**
 * This method Select unique distributors record from Sqlite table.
 * @param  {object} db
 * @param  {json} mId
 */

function fetchDistributors(db, fn) {

    var select_query = "select dbtr_id, dbtr_name FROM mxpg_store GROUP BY dbtr_id";
    db.transaction(function(tx){
        tx.executeSql(select_query , [], function(tx, response) {
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

/**
 * This method Select unique locations record from SQlite table.
 * @param  {object} db
 * @param  {json} mId
 */

function fetchLocations(db, details, fn) {
    var query = "select loc_id, loc_name FROM mxpg_store";
    var temp = [];
    if(details && details.distId){
        temp.push("dbtr_id='" + details.distId + "' ");
    }

    var length = temp.length;
    if(length > 0){
        query += " WHERE ";
    }

    for(var i = 0; i < length; i++){
        if(i+1 != length){
            query += temp[i] + " AND ";
        }else{
            query += temp[i] + " GROUP BY loc_id";
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

/**
 * This method Select unique branches record from SQlite table.
 * @param  {object} db
 * @param  {json} mId
 */

function fetchBranches(db, details, fn) {
    var query = "select brch_id, brch_name FROM mxpg_store";
    var temp = [];
    if(details && details.distId){
        temp.push("dbtr_id='" + details.distId + "' ");
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
            query += temp[i] + " GROUP BY brch_id";
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
