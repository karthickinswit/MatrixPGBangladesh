function createAuditHistoryTable(tx, success, error){
    var createStatement = "CREATE TABLE IF NOT EXISTS mxpg_audit_history(audit_id TEXT, store_id TEXT, date TEXT)";
    tx.executeSql(createStatement, [], success, error);
    var createIndex = "CREATE UNIQUE INDEX auditHistoryIndex ON mxpg_audit_history(audit_id, store_id)";
    tx.executeSql(createIndex);
}

function populateAuditHistoryTable(db, audit, success, error) {
    db.transaction(function(tx){
        tx.executeSql('INSERT OR replace INTO mxpg_audit_history(audit_id, store_id, date) VALUES (?,?,?);',
        [audit.auditId, audit.storeId, audit.date], success, error);
    });
}

function selectAuditHistories(db, fn) {
    var query = "SELECT * FROM mxpg_audit_history ORDER BY store_id DESC";
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx,response) {
            fn(response.rows);
        }, function(tx,error){
            console.log(error);
        });
    });
}

function removeAuditHistories(db, auditId, storeId, success, error){

    var query = "DELETE FROM mxpg_audit_history WHERE audit_id='" + auditId + "' AND store_id='" + storeId + "';";

    db.transaction(function(tx){
        tx.executeSql(query);
    });
}