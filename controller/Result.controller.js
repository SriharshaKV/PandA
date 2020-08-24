sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"comZSAPR/model/formatter",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/model/type/Date",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/UIComponent",
	"sap/m/MessageStrip",
	"sap/m/VBox",
	"sap/ui/export/Spreadsheet",
	"sap/ui/export/library",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller, History, formatter, Dialog, Button, SimpleForm, Label, Text, Date, JSONModel, UIComponent, MessageStrip, VBox,
	Spreadsheet, exportLibrary, MessageToast, MessageBox) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return Controller.extend("comZSAPR.controller.Result", {
		formatter: formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf comZSAPR.view.Result
		 */
		onInit: function() {
			var rModel = sap.ui.getCore().getModel("Results");
			var oInput = sap.ui.getCore().getModel("input");
			this.getView().setModel(oInput, "Inputs");
			this.getView().setModel(rModel);
			var oRouter = this.getRouter();
			this.oDModel = this.getOwnerComponent().getModel("ZSAPA");

			oRouter.getRoute("Result").attachMatched(this._oRouteMatched, this);
		},

		_oRouteMatched: function() {
			var rModel = sap.ui.getCore().getModel("Results");
			this.getView().setModel(rModel);
			this.byId("id_SalesOrder").setText("");
			this.byId("id_PO").setText("");
			this.byId("id_Create").setEnabled();

		},
		getRouter: function() {
			return UIComponent.getRouterFor(this);
		},
		onNavBack: function() {

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Home", true);
			}
		},
		onDeliveryDate: function(oEvent) {
			var sValue = oEvent.getSource().getText();
			if (sValue.length > 0) {
				var oBindingContext = oEvent.getSource().getBindingContext();
				var sRowData = this.getView().getModel().getProperty(oBindingContext.sPath);
				var oDateModel = new JSONModel();
				oDateModel.setData(sRowData);
				this.getView().setModel(oDateModel, "Date");
				if (!this.dateDialog) {
					this.dateDialog = sap.ui.xmlfragment("comZSAPR.fragment.DatesDisplay", this);
					this.getView().addDependent(this.dateDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.dateDialog);
				}
				this.dateDialog.open();
			}
		},
		dateDialogClose: function() {
			this.dateDialog.close();
		},
		setDateFormat2: function(sdate) {
			if (sdate !== null && sdate !== undefined) {
				var Month = sdate.getMonth() + 1;
				var Date1 = Month + "." + sdate.getDate() + "." + sdate.getFullYear();
			}
			return Date1;
		},
		onNetprice: function(oEvent) {
			var sValue = oEvent.getSource().getText();
			if (sValue.length > 0) {
				var oBindingContext = oEvent.getSource().getBindingContext();
				var sRowData = this.getView().getModel().getProperty(oBindingContext.sPath);
				var oDateModel = new JSONModel();
				oDateModel.setData(sRowData);
				this.getView().setModel(oDateModel, "Netwr");
				if (!this.NetwrDialog) {
					this.NetwrDialog = sap.ui.xmlfragment("comZSAPR.fragment.NetwrDetails", this);
					this.getView().addDependent(this.NetwrDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.NetwrDialog);
				}
				this.NetwrDialog.open();
			}
		},
		netwrDialogClose: function(oEvent) {
			this.NetwrDialog.close();
		},

		onTableSettings: function(oEvent) {},
		onMatnrClick: function(oEvent) {
			var sValue = oEvent.getSource().getText();
			if (sValue.length > 0) {
				var oBindingContext = oEvent.getSource().getBindingContext();
				var sRowData = this.getView().getModel().getProperty(oBindingContext.sPath);
				var oDateModel = new JSONModel();
				oDateModel.setData(sRowData);
				this.getView().setModel(oDateModel, "MatDetails");
				if (!this.MatnrDialog) {
					this.MatnrDialog = sap.ui.xmlfragment("comZSAPR.fragment.MatDetailsDialog", this);
					this.getView().addDependent(this.MatnrDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.MatnrDialog);
				}
				this.MatnrDialog.open();
			}

		},
		matnrDialogClose: function(oEvent) {
			this.MatnrDialog.close();
		},

		handleMessageClick: function(oEvent) {
			var oSourceLink = oEvent.getSource();
			var oMessage = oEvent.getSource().data("mesg");
			var oMessageType = oEvent.getSource().data("mesgType");
			var sMsgtype;
			if (oMessageType === "E") {
				sMsgtype = "Error";
			} else if (oMessageType === "W") {
				sMsgtype = "Warning";
			} else {
				sMsgtype = "Information";
			}
			var aMsgs = oMessage.split("/");
			var oVBox1 = new VBox();
			if (!this.MesgPopover) {
				this.MesgPopover = sap.ui.xmlfragment("comZSAPR.fragment.MessagePopover", this);
				this.getView().addDependent(this.MesgPopover);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.MesgPopover);
				// var oMsgStrips = [];

			}
			this.MesgPopover.removeAllContent();
			if (aMsgs.length === 1 && aMsgs[0].length === 0) {
				// oVBox1.addItem(oMessageStrip);
			} else {
				for (var i = 0; i < aMsgs.length; i++) {
					var oMessageStrip = new MessageStrip({
						text: aMsgs[i],
						type: sMsgtype,
						showIcon: true
					}).addStyleClass("sapUiTinyMargin");
					oVBox1.addItem(oMessageStrip);
				}

			}
			this.MesgPopover.addContent(oVBox1);
			this.MesgPopover.openBy(oSourceLink);
		},
		createColumnConfig: function() {
			return [{
				label: "Item No",
				property: "Posnr",
				type: EdmType.Number
			}, {
				label: "Material",
				property: "Matnr"
					// template: "{1} ({0})"
			}, {
				label: "Plant",
				property: "Werks"
					// template: "{1} ({0})"
			}, {
				label: "Route",
				property: "Route"
			}, {
				label: "Ordered Quantity",
				property: "OrderQty"
			}, {
				label: "Confirmed Quantity",
				property: "ConfirQty"
			}, {
				label: "Unit of Measure",
				property: "Vrkme"
			}, {
				label: "Customer Requested Date",
				type: EdmType.Date,
				property: "Crd",
				inputFormat: "yyyymmdd"
			}, {
				label: "Delivery Date",
				type: EdmType.Date,
				property: "Edatu",
				inputFormat: "yyyymmdd"

			}, {
				label: "Net Price",
				type: EdmType.Currency,
				property: "Kwert",
				unitProperty: "Waerk",
				displayUnit: true
			}, {
				label: "Shipping Condition",
				property: "Vsbed"
			}, {
				label: "Entered Material",
				property: "MatEntrd"
			}, {
				label: "Customer Material",
				property: "Kdmat"
			}, {
				label: "Messagel",
				property: "Log"
			}];
		},
		onExportToExcel: function() {
			var aCols = this.createColumnConfig();
			var aResults = this.getView().getModel().getProperty("/results");
			var oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: aResults,
				fileName: "Price & Availability entries"
			};
			var oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function() {
					MessageToast.show("Spreadsheet downloaded successfully");
				})
				.finally(oSheet.destroy);
		},
		onPODetailsCancel: function() {
			this._PODialog.close();
		},
		onProceedCreateSO: function() {
			var sPONumber = sap.ui.getCore().byId("id_PONumber").getValue();
			this._PODialog.close();
			var oInputs = sap.ui.getCore().getModel("input");
			var oInputData = oInputs.getData();
			var oCreateData = {};
			oCreateData.Vbeln = "0000000002";
			oCreateData.Auart = oInputData.docType;
			oCreateData.Vkorg = oInputData.salOrg;
			oCreateData.Vtweg = oInputData.disChn;
			oCreateData.Spart = oInputData.div;
			oCreateData.Kunnr = oInputData.sol2Par;
			oCreateData.Kunwe = oInputData.shp2Par;
			oCreateData.Vsbed = oInputData.shpCon;
			oCreateData.Hcrd = oInputData.reqDat;
			oCreateData.Prsdt = oInputData.priDat;
			oCreateData.Bstkd = sPONumber;
			oCreateData.ItemSet = [];
			for (var i = 0; i < this.aSelItems.length; i++) {
				var oItem;
				var iItem = {};
				var spath = "/items/" + this.aSelItems[i];
				oItem = oInputs.getProperty(spath);
				iItem.Matnr = oItem.mat;
				iItem.Kwmeng = oItem.quan;
				iItem.Kdmat = oItem.cusMat;
				iItem.Ean11 = oItem.EAN;
				iItem.Werks = oItem.plant;
				iItem.Meinh = oItem.uom;
				iItem.Icrdd = oItem.delDate;
				iItem.Vsbed = oItem.shpCon;
				iItem.Meinh = oItem.uom;
				iItem.Route = oItem.route;

				oCreateData.ItemSet.push(iItem);
			}
			//message set
			oCreateData.ErrorMessageSet = [];
			var mEntry = {};
			mEntry.Type = "E";
			mEntry.Message = "From UI";
			oCreateData.ErrorMessageSet.push(mEntry);

			var that = this;
			if (!this._oBusyDialog) {

				this._oBusyDialog = sap.ui.xmlfragment("comZSAPR.fragment.BusySOCreation", this);
				this.getView().addDependent(this._oBusyDialog);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oBusyDialog);
				this._oBusyDialog.open();

			} else {
				this._oBusyDialog.open();
			}

			this.oDModel.create("/HeaderSet", oCreateData, {
				method: "POST",
				success: function(odata, oResponse) {
					if (odata.Vbeln !== '0000000002') {
						var oCreateBtn = that.byId("id_Create");
						oCreateBtn.setEnabled(false);
						var oSalesOrder = that.byId("id_SalesOrder");
						var oPO = that.byId("id_PO");
						oSalesOrder.setText(odata.Vbeln);
						oPO.setText(odata.Bstkd);
						MessageToast.show("Sales Order Created Successfully...", {
							duration: 40000
						});
						var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
						var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
							target: {
								semanticObject: "ZVA05_CDS",
								action: "change"
							},
							params: {
								"P_VBELN": odata.Vbeln
							}
						}));
						oCrossAppNavigator.toExternal({
							target: {
								shellHash: hashUrl
							}
						});
					}
					that._oBusyDialog.close();
				},
				error: function(oError, oResponse) {
					that._oBusyDialog.close();
					// that.onErrorReturn(oError, oResponse);
				}
			});
		},
		callPODialog: function() {
			var oTab2 = this.getView().byId("id_resultTable");
			this.aSelItems = oTab2.getSelectedIndices();
			// var oInputs = sap.ui.getCore().getModel("input");
			var rModel = sap.ui.getCore().getModel("Results");
			var isErrSelected, isWarningSelected;
			if (this.aSelItems.length === 0) {
				MessageToast.show("Please Select Line items...");
				return;
			}
			// check line items msg types.
			for (var i = 0; i < this.aSelItems.length; i++) {
				var spath = "/results/" + this.aSelItems[i];
				var oItem = rModel.getProperty(spath);
				if (oItem.MsgType === "E") {
					isErrSelected = true;
					break;
				} else if (oItem.MsgType === "W") {
					isWarningSelected = true;
				}
			}
			if (isErrSelected === true) {
				MessageToast.show("Selected line having Error , Order Creation would not be Successful ");
				return;
			}
			var that = this;
			if (isWarningSelected === true) {
				MessageBox.warning("Selected line having Warning, Result may lead to incompletion, Want to Proceed ?", {
					actions: ["Continue", MessageBox.Action.CANCEL],
					emphasizedAction: "Continue",
					onClose: function(sAction) {
						if (sAction === "CANCEL") {
							return;
						} else if (sAction === "Continue") {
							if (!that._PODialog) {

								that._PODialog = sap.ui.xmlfragment("comZSAPR.fragment.PONumber", that);
								that.getView().addDependent(this._PODialog);

								jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._PODialog);
								that._PODialog.open();

							} else {
								that._PODialog.open();
							}
						}
					}
				});
			} else {
				//raise PO popup
				if (!this._PODialog) {

					this._PODialog = sap.ui.xmlfragment("comZSAPR.fragment.PONumber", this);
					this.getView().addDependent(this._PODialog);

					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._PODialog);
					this._PODialog.open();

				} else {
					this._PODialog.open();
				}
			}

		},
		onNavigateVA03: function(oEvent) {
			var sSONumber = oEvent.getSource().getText();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ZVA05_CDS",
					action: "change"
				},
				params: {
					"P_VBELN": sSONumber
				}
			}));
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hashUrl
				}
			});

		},
		onUnconfirmQuan: function(oEvent) {

			var sValue = oEvent.getSource().getText();
			if (sValue.length > 0) {
				var oBindingContext = oEvent.getSource().getBindingContext();
				var sRowData = this.getView().getModel().getProperty(oBindingContext.sPath);
				var sUom = sRowData.Vrkme;
				var oUnconfirm = sRowData.Unconfirm;
				if (oUnconfirm.length === 0) {
					return;
				}
				// var oUnconfirm = "120:20201027/150:20201127";
				var aLines = oUnconfirm.split("/");
				var aTableData = [];

				for (var i = 0; i < aLines.length; i++) {
					var sRow = aLines[i];
					var aCols = sRow.split(":");
					var oRow = {};
					oRow.unQuan = aCols[0];
					oRow.uom = sUom;
					oRow.date1 = aCols[1];
					aTableData.push(oRow);
				}
				var oDateModel = new JSONModel();
				oDateModel.setData(aTableData);
				this.getView().setModel(oDateModel, "Unconfirm");
				if (!this.UnconfirmQuantity) {
					this.UnconfirmQuantity = sap.ui.xmlfragment("comZSAPR.fragment.UnconfirmQuantity", this);
					this.getView().addDependent(this.UnconfirmQuantity);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.UnconfirmQuantity);
				}
				this.UnconfirmQuantity.open();
			}
		},
		UnconfirmClose: function() {
				this.UnconfirmQuantity.close();
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf comZSAPR.view.Result
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf comZSAPR.view.Result
		 */
		// onAfterRendering: function() {
		// 	var oTable = this.byId("id_resultTable");
		// 	var rows = oTable.getRows();
		// 	for (var i = 0; i < rows.length; i++) {
		// 		// percentValue="{parts:[{path:'ConfirQty'},{path:'OrderQty'}],formatter:'.formatter.calculateAvailability'}"
		// 		// displayValue="{parts:[{path:'ConfirQty'},{path:'OrderQty'}],formatter:'.formatter.calculateAvailabilityDisplay'}"
		// 		var cols = rows[i].getCells();
		// 		var orderQuanCell = cols[4];
		// 		var orderQuan = orderQuanCell.getNumber();
		// 		var confirmQuanCell = cols[5];
		// 		var confirmQuan = confirmQuanCell.getNumber();
		// 		var sPercentage = (100 * confirmQuan) / orderQuan;
		// 		var ProgressCell = cols[6];
		// 		ProgressCell.setPercentValue(sPercentage);
		// 		ProgressCell.setDisplayValue(sPercentage + "%");
		// 	}
		// }

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf comZSAPR.view.Result
		 */
		//	onExit: function() {
		//
		//	}

	});

});