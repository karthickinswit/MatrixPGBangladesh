define([
	"backbone",
	"mustache",
	"select2"
], function(Backbone, Mustache) {
	var Verify = {};
	Verify.Model = Backbone.Model.extend({
		
		initialize: function() {}                             
	});

	Verify.View = Backbone.View.extend({

		className: "audits",

		events:{
			"click .go_next": "showSignaturePage",
			"click .take_signature_photo": "takeSignaturePicture",
			"click .retake_signature_photo": "takeSignaturePicture",
			"click .complete_audit": "completeAudit",
			"click .back": "back"
		},

		verifyAudit: function(mId){
			var that = this;

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

            this.getStoreName(mId);

			require(['templates/t_verify_audits'], function(template){
				var fn = function(results){
					var products = [];
					for(var i = 0; i < results.length; i++){
						var product = {};

						product.productId = results[i].productId;
						product.productName = results[i].productName;
						product.storeId = results[i].storeId;
						product.isImage = false;
						if(results[i].imageURI){
							product.isImage = true;
						}
						product.imageURI = results[i].imageURI;
						product.image = results[i].image;

						if(i == 0){
							product.norms = [];
							product.norms.push(results[i]);
							products.push(product);
						}else{
							for(var j = 0; j < products.length; j++){
								if(products[j].productId == results[i].productId){
									products[j].norms.push(results[i]);
									break;
								}

								if(j+1 == products.length){
									product.norms = [];
									product.norms.push(results[i]);
									products.push(product);
									break;
								}
							}
						}
					}

					var html = Mustache.to_html(
						template, 
						{
							"products":products, 
							"name":that.storeName, 
							"storeId":storeId, 
							"auditId":auditId, 
							"mId":mId
						});

					that.$el.empty().append(html);

					that.refreshScroll("audit_verify");

					return that;
				};

				selectProductsToVerify(db, auditId, storeId, "", fn);
			});
		},

		showSignaturePage: function(){
			var that = this;

			var mId = this.model.get("mId");

			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			require(['templates/t_store_score'], function(template){
				var html = Mustache.to_html(template, {"mId": mId, "name": that.storeName});
				that.$el.empty().append(html);

				selectCompletedAudit(db, mId, function(audit){
	            	if(audit.length > 0){
	            		var imageURI = audit.item(0).sign_image;

	            		if(imageURI){
	            			var template = "<img src='{{imageURI}}' width='100%' height='200'><a class='retake_signature_photo retake_photo'>Retake</a>";
							var html = Mustache.to_html(template, {"imageURI":imageURI});

							that.$el.find(".take_signature_photo").remove();
							that.$el.find(".photo_block").empty().append(html);
							that.refreshScroll("audit_score");
	            		}
	                }
            	});

				return that;
			});
		},

		takeSignaturePicture:function(event){
			var that = this;

			var mId = that.$el.find(".complete_audit").attr("href");
			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

            getStoreCode(db, storeId, function(storeCode){
            	var callback = function(imageURI){
					updateSignaturePhoto(db, auditId, storeId, imageURI);
					that.refreshScroll("audit_score");
				}

				var takeEl = "take_signature_photo";
				var retakeEl = "retake_signature_photo";
				inswit.takePicture(callback, takeEl, retakeEl, storeCode);
            });
		},

		completeAudit: function(event){
			var that = this;

			if($(event.currentTarget).hasClass("clicked")){
				return;
			}
			$(event.currentTarget).addClass("clicked");

			var mId = $(event.currentTarget).attr("href");
			var id = mId.split("-");
            var auditId = id[0];
            var storeId = id[1];
            var channelId = id[2];

			getDistributor(db, auditId, storeId, function(distributor){

	 			if(distributor != inswit.DISTRIBUTOR){ //For certain distributor photo is not mandatory
	 				var image = $(".photo_block img").attr("src");
					if(!image){
						inswit.alert("Please take a sign off photo!");
						$(event.currentTarget).removeClass("clicked");
						return;
					}
	 			}

	 			var callback = function(isYes){
					$(event.currentTarget).removeClass("clicked");
					if(isYes == 1){

		   	           updateAuditStatus(db, auditId, storeId);

		   	            var route = "#audits/" + mId + "/upload";
		   				router.navigate(route, {
		   	                trigger: true
		   	            });
					}
				}

				var title = "Alert";
				var message = "Are you sure you want to complete this audit?\n\n" +
							  "This will update the audit status as 'Audited', after which audit details cannot be modified.";
	            var buttons = ["Yes", "No"];

				inswit.confirm(message, callback, title, buttons);

	 		}, function(){

	 		});
		},

		back: function(){
			window.history.back();
		},

		getStoreName: function(mId){
			var that = this;

			fetchStoreName(db, mId, function(result){
				that.storeName = result.storeName;
			});
		},

		refreshScroll: function(wrapperEle) {
			if(!this.scrollView) {
				this.scrollView = new iScroll(wrapperEle);
			}
			this.scrollView.refresh();
		}
	});

	return Verify;
});