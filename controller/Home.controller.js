sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"comZSAPR/model/formatter",
	"sap/ui/model/Filter",
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/MessageBox"
], function(Controller, JSONModel, Fragment, MessageToast, formatter, Filter, MessageItem, MessagePopover, ColumnListItem, Label,
	MessageBox) {
	"use strict";

	return Controller.extend("comZSAPR.controller.Home", {
		formatter: formatter,
		onInit: function() {
			var scurrentDate = this.formatter.getYYYYMMDD(new Date());

			var oData = {
				docType: "ZOR",
				salOrg: "US01",
				disChn: "OG",
				div: "01",
				sol2Par: "", //1000000001
				shp2Par: "",
				shpCon: "01",
				reqDat: scurrentDate, //cURRENT DATE
				priDat: scurrentDate,
				items: [{
					mat: "", //HOM120CP
					quan: "", //11
					cusMat: "",
					EAN: "",
					plant: "",
					delDate: "",
					shpCon: "01",
					uom: "", //default pc
					route: ""
				}]
			};

			var oJModel = new JSONModel(oData);
			oJModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(oJModel);

			this.oDModel = this.getOwnerComponent().getModel("ZSAPA");

			//customer
			var oCustomerJModel = new JSONModel();
			oCustomerJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/DebiaSet");
			this.getView().setModel(oCustomerJModel, "Customer");
			this.getView().setModel(oCustomerJModel, "Customer2");

			//Sales Doc type
			var oSDocTypeJModel = new JSONModel();
			oSDocTypeJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/HTvakSet");
			this.getView().setModel(oSDocTypeJModel, "DocType");

			//Sales org
			var oSalesOrgJModel = new JSONModel();
			oSalesOrgJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/HTvkoSet");
			this.getView().setModel(oSalesOrgJModel, "SaleOrg");

			//Distribution Channel 
			var oDisChnlJModel = new JSONModel();
			oDisChnlJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/HTvkovSet");
			this.getView().setModel(oDisChnlJModel, "DistChnl");

			//Division 
			var oDivisionJModel = new JSONModel();
			oDivisionJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/HTvtaSet");
			this.getView().setModel(oDivisionJModel, "Division");

			//Shipping Condition 
			// var oShpCondJModel = new JSONModel();
			// oShpCondJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/HTvsbSet");
			// this.getView().setModel(oShpCondJModel, "ShpCond");

			//Matnr 
			var oMatnrJModel = new JSONModel();
			oMatnrJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/Mat1sSet");
			this.getView().setModel(oMatnrJModel, "MaterialJ");

			//Customer matnr 
			var oCustMatnrJModel = new JSONModel();
			oCustMatnrJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/VmcvaSet");
			this.getView().setModel(oCustMatnrJModel, "CustMatnr");

			//EAN
			var oEANJModel = new JSONModel();
			oEANJModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/Mat1nSet");
			this.getView().setModel(oEANJModel, "EAN");

			//Plant 
			// var oPlantModel = new JSONModel();
			// oPlantModel.loadData("/sap/opu/odata/sap/ZUI5_SEARCH_HELP_SRV/HT001wSet");
			// this.getView().setModel(oPlantModel, "Plant");

			//For Error Messages
			var oErrModel = new JSONModel();
			this.getView().setModel(oErrModel, "messages");

			this.createMessagePopover();

			var oTable = this.getView().byId("id_itemTable");
			var that = this;
			oTable.attachBrowserEvent("keydown", function(e) {
				if (e.keyCode === 13) {
					that.onAddRow();
				}
			});

		},
		onAddRow: function() {
			var oModel = this.getView().getModel();
			var oData = oModel.getData();
			var oHeaderShpc = this.getView().byId("id_shipCon");
			var sHeaderShpc = oHeaderShpc.getValue();
			var entry = {
				mat: "",
				quan: "",
				cusMat: "",
				EAN: "",
				plant: "",
				delDate: "",
				shpCon: sHeaderShpc,
				uom: "",
				route: ""

			};
			oData.items.push(entry);
			oModel.setData(oData);

			//setting focus to first field on the new row.
			var that = this;
			setTimeout(function() {
				var oTab1 = that.getView().byId("id_itemTable");

				if (oTab1.getBinding()) {
					var lastRow;
					if (oTab1.getBinding().iLength === 0) {

						lastRow = oTab1.getBinding().iLength;
					} else {

						lastRow = oTab1.getBinding().iLength - 1;
					}
				}
				var oRows1 = oTab1.getRows();
				var newRow = oRows1[lastRow];
				var oCells = newRow.getCells();
				var oCell1 = oCells[0];
				oCell1.focus();
			}, 200);

		},
		onDeleteRow: function(oEvent) {
			var oTable = this.getView().byId("id_itemTable");
			var selectedIndices = oTable.getSelectedIndices();
			var oData = this.getView().getModel().getData();
			var inOrder = selectedIndices.reverse();

			for (var i = 0; i < inOrder.length; i++) {
				oData.items.splice(inOrder[i], 1);
			}
			this.getView().getModel().refresh(true);
			// oTable.removeSelectionInterval(0, oData.items.length);
			oTable.clearSelection();

		},
		onSimulate: function() {
			this.errvalidation = false;
			if (!this.checkMandatoryFields()) {
				return;
			}
			this.callSimulate();
		},
		checkMandatoryFields: function() {
			var valid = true;
			this.docType = this.getView().byId("id_docType");
			this.salOrg = this.getView().byId("id_salOrg");
			this.disChnl = this.getView().byId("id_disChnl");
			this.division = this.getView().byId("id_division");
			this.sol2Party = this.getView().byId("id_sol2Party");

			if (this.docType.getValue() === "") {
				this.docType.setValueState("Error");
				this.docType.setValueStateText("Mandatory Field");
				if (valid !== false) {
					valid = false;
				}
			} else {
				this.docType.setValueState("None");
				this.docType.setValueStateText("");
			}

			if (this.salOrg.getValue() === "") {
				this.salOrg.setValueState("Error");
				this.salOrg.setValueStateText("Mandatory Field");
				if (valid !== false) {
					valid = false;
				}
			} else {
				this.salOrg.setValueState("None");
				this.salOrg.setValueStateText("");
			}

			if (this.disChnl.getValue() === "") {
				this.disChnl.setValueState("Error");
				this.disChnl.setValueStateText("Mandatory Field");
				if (valid !== false) {
					valid = false;
				}
			} else {
				this.disChnl.setValueState("None");
				this.disChnl.setValueStateText("");
			}

			if (this.division.getValue() === "") {
				this.division.setValueState("Error");
				this.division.setValueStateText("Mandatory Field");
				if (valid !== false) {
					valid = false;
				}
			} else {
				this.division.setValueState("None");
				this.division.setValueStateText("");
			}

			if (this.sol2Party.getValue() === "") {
				this.sol2Party.setValueState("Error");
				this.sol2Party.setValueStateText("Mandatory Field");
				if (valid !== false) {
					valid = false;
				}
			} else {
				this.sol2Party.setValueState("None");
				this.sol2Party.setValueStateText("");
			}
			return valid;
		},
		callSimulate: function() {
			var mData;
			var oEntry = {};
			var item = [];
			//clear Erro Model data, so it will be refreshed.
			// var oERModel = new JSONModel();
			this.getView().getModel("messages").setData({});
			mData = this.getView().getModel().getData();
			oEntry.Vbeln = "0000000001";
			oEntry.Auart = mData.docType;
			oEntry.Vkorg = mData.salOrg;
			oEntry.Vtweg = mData.disChn;
			oEntry.Spart = mData.div;
			oEntry.Kunnr = mData.sol2Par;
			oEntry.Kunwe = mData.shp2Par;
			oEntry.Vsbed = mData.shpCon;
			oEntry.Hcrd = mData.reqDat;
			oEntry.Prsdt = mData.priDat;
			oEntry.ItemSet = [];
			//items
			for (var i = 0; i < mData.items.length; i++) {
				var iItem = {};
				item.Vbeln = "0000000001";
				iItem.Matnr = mData.items[i].mat;
				if (mData.items[i].quan === "") {
					this.highlightQuantityField(i);
					this.errvalidation = true;
				} else {
					iItem.Kwmeng = mData.items[i].quan;
				}
				iItem.Kwmeng = mData.items[i].quan;
				iItem.Kdmat = mData.items[i].cusMat;
				iItem.Ean11 = mData.items[i].EAN;
				iItem.Werks = mData.items[i].plant;
				iItem.Meinh = mData.items[i].uom;
				iItem.Icrdd = mData.items[i].delDate;
				iItem.Vsbed = mData.items[i].shpCon;
				iItem.Meinh = mData.items[i].uom;
				if (iItem.Vsbed === "03") {
					if (mData.items[i].route === "") {
						this.highlightRouteField(i);
						this.errvalidation = true;
					} else {
						iItem.Route = mData.items[i].route;
					}
				} else {
					iItem.Route = "";
				}

				oEntry.ItemSet.push(iItem);
			}
			if (this.errvalidation === true) {
				return;
			}
			// Result Set
			oEntry.ResultSet = [];
			var rEntry = {};
			rEntry.Posnr = "000001";
			rEntry.Matnr = "";
			oEntry.ResultSet.push(rEntry);

			//message set
			oEntry.ErrorMessageSet = [];
			var mEntry = {};
			mEntry.Type = "E";
			mEntry.Message = "From UI";
			oEntry.ErrorMessageSet.push(mEntry);

			var that = this;
			if (!this._oBusyDialog) {

				this._oBusyDialog = sap.ui.xmlfragment("comZSAPR.fragment.BusyDialog", this);
				this.getView().addDependent(this._oBusyDialog);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oBusyDialog);
				this._oBusyDialog.open();

			} else {
				this._oBusyDialog.open();
			}
			this.oDModel.create("/HeaderSet", oEntry, {
				method: "POST",
				success: function(odata, oResponse) {
					if (odata.ErrorMessageSet.results.length > 0) {
						//Error
						that.handleErrorMessages(odata.ErrorMessageSet);
					} else {
						that.onSuccessReturn(odata, oResponse);
					}
				},
				error: function(oError, oResponse) {
					that.onErrorReturn(oError, oResponse);
				}
			});
		},

		onSuccessReturn: function(odata, oResponse) {
			this._oBusyDialog.close();
			var oResults = odata.ResultSet;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (oResults.results.length > 0) {
				var rModel = new JSONModel();
				rModel.setData(oResults);
				sap.ui.getCore().setModel(rModel, "Results");
				sap.ui.getCore().getModel("Results").refresh(true);
				var oModelj1 = this.getView().getModel();
				sap.ui.getCore().setModel(oModelj1, "input");
				oRouter.navTo("Result");
			}
		},
		onErrorReturn: function(oError, oResponse) {
			this._oBusyDialog.close();
			MessageToast.show("Please Check Data Entered");
		},
		handleErrorMessages: function(messageSet) {
			this._oBusyDialog.close();
			var oEButton = this.getView().byId("messagePopoverBtn");
			var oEModel = this.getView().getModel("messages");
			oEModel.setData(messageSet.results);
			setTimeout(function() {
				this.oMP.openBy(oEButton);
			}.bind(this), 100);

		},
		handleMessagePopoverPress: function(oEvent) {
			if (!this.oMP) {
				this.createMessagePopover();
			}
			this.oMP.toggle(oEvent.getSource());
		},
		highlightQuantityField: function(i) {
			var oTable = this.byId("id_itemTable");
			var oInput = oTable.getCellControl(i, 1);
			oInput.setValueState("Error");
			oInput.setValueStateText("Enter Quantity");
		},
		highlightRouteField: function(i) {
			var oTable = this.byId("id_itemTable");
			var oInput = oTable.getCellControl(i, 5);
			oInput.setValueState("Error");
			oInput.setValueStateText("Route is mandatory when Shipping Condition is Express(03)");
		},
		createMessagePopover: function() {
			this.oMP = new MessagePopover({
				items: {
					path: "messages>/",
					template: new MessageItem({
						title: "{messages>Message}",
						// subtitle: "Message>Message",
						type: {
							path: "{messages>Type}",
							formatter: this.formatter.getMessageType
						},
						description: "{messages>Message}"
					})
				}
			});
			this.getView().byId("messagePopoverBtn").addDependent(this.oMP);
		},
		onVHSalesDocType: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			//Call F4 Dialog
			this.sDocType = "id_docType";
			if (!this._oVHDocTypeDialog) {

				this._oVHDocTypeDialog = sap.ui.xmlfragment("comZSAPR.fragment.VHSODocType", this);
				this.getView().addDependent(this._oVHDocTypeDialog);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHDocTypeDialog);
			}
			this._oVHDocTypeDialog.getBinding("items").filter([new Filter("Auart", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHDocTypeDialog.open(sValue);
		},
		onVHSalesOrg: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			//Call F4 Dialog
			this.sSalesOrg = "id_salOrg";
			if (!this._oVHSalesOrgDialog) {

				this._oVHSalesOrgDialog = sap.ui.xmlfragment("comZSAPR.fragment.VHSalesOrg", this);
				this.getView().addDependent(this._oVHSalesOrgDialog);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHSalesOrgDialog);
			}
			this._oVHSalesOrgDialog.getBinding("items").filter([new Filter("Vkorg", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHSalesOrgDialog.open(sValue);
		},
		onVHSol2Party: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			//Call F4 Dialog
			this.sSol2partId = "id_sol2Party";
			if (!this._oVHSol2PartyDialog) {

				this._oVHSol2PartyDialog = sap.ui.xmlfragment("comZSAPR.fragment.VHSold2Party", this);
				this.getView().addDependent(this._oVHSol2PartyDialog);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHSol2PartyDialog);
			}
			this._oVHSol2PartyDialog.getBinding("items").filter([new Filter("Kunnr", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHSol2PartyDialog.open(sValue);
		},
		onVHShp2Party: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			//Call F4 Dialog
			this.sShp2partId = "id_shp2Party";
			if (!this._oVHShp2PartyDialog) {

				this._oVHShp2PartyDialog = sap.ui.xmlfragment("comZSAPR.fragment.VHShip2Party", this);
				this.getView().addDependent(this._oVHShp2PartyDialog);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHShp2PartyDialog);
			}
			this._oVHShp2PartyDialog.getBinding("items").filter([new Filter("Kunnr", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHShp2PartyDialog.open(sValue);

		},
		onVHDistibutionChnl: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			//Call F4 Dialog
			this.sDisChnl = "id_disChnl";
			if (!this._oVHDisChnlDialog) {

				this._oVHDisChnlDialog = sap.ui.xmlfragment("comZSAPR.fragment.VHDistributionChannel", this);
				this.getView().addDependent(this._oVHDisChnlDialog);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHDisChnlDialog);
			}
			this._oVHDisChnlDialog.getBinding("items").filter([new Filter("Vtweg", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHDisChnlDialog.open(sValue);
		},
		onVHDivision: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			//Call F4 Dialog
			this.sDivision = "id_division";
			if (!this._oVHDivision) {

				this._oVHDivision = sap.ui.xmlfragment("comZSAPR.fragment.VHDivision", this);
				this.getView().addDependent(this._oVHDivision);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHDivision);
			}
			this._oVHDivision.getBinding("items").filter([new Filter("Spart", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHDivision.open(sValue);
		},

		onHeaderShpCondChg: function(oEvent) {
			var oSelItem = oEvent.getParameter("selectedItem");
			var sKey = oSelItem.getKey();
			var oData = this.getView().getModel().getData();
			var aitems = oData.items;
			for (var i = 0; i < aitems.length; i++) {
				aitems[i].shpCon = sKey;
				aitems[i].route = "";
			}
		},
		onItemShpCondChg: function(oEvent) {
			var oSelItem = oEvent.getParameter("selectedItem");
			var sKey = oSelItem.getKey();
			if (sKey !== "03") {
				var oRow = oEvent.getSource().getParent();
				if (oRow) {
					var oCells = oRow.getAggregation("cells");
					//matnr Column cell
					var idrowshpcond = oCells[5].getId();
					var oShpcond1 = sap.ui.getCore().byId(idrowshpcond);
					oShpcond1.setValue("");
				}
			}
		},
		onVHCustomerMaterial: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			this.idCustMatnr = oEvent.getSource().getId();
			var oRow = oEvent.getSource().getParent();
			if (oRow) {
				var oCells = oRow.getAggregation("cells");
				//matnr Column cell
				this.idrowMatnr = oCells[0].getId();
			}
			if (!this._oVHCustMatnr) {

				this._oVHCustMatnr = sap.ui.xmlfragment("comZSAPR.fragment.VHCustMaterial", this);
				this.getView().addDependent(this._oVHCustMatnr);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHCustMatnr);
			}
			this._oVHCustMatnr.getBinding("items").filter([new Filter("Kdmat", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHCustMatnr.open(sValue);
		},

		onVHEAN: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			this.idEAN = oEvent.getSource().getId();
			var oRow = oEvent.getSource().getParent();
			if (oRow) {
				var oCells = oRow.getAggregation("cells");
				//matnr Column cell
				this.idrowMatnr = oCells[0].getId();
			}
			if (!this._oVHEAN) {
				this._oVHEAN = sap.ui.xmlfragment("comZSAPR.fragment.VHEAN", this);
				this.getView().addDependent(this._oVHEAN);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHEAN);
			}
			this._oVHEAN.getBinding("items").filter([new Filter("Ean11", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHEAN.open(sValue);
		},
		vhEANSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Ean11", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		vhEANConfrim: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts) {
				var oRow = aContexts[0].getObject();
				var sEanValue = oRow.Ean11;
				var sMaterialValue = oRow.Matnr;
				var oEAN = sap.ui.getCore().byId(this.idEAN);
				var oMatnr = sap.ui.getCore().byId(this.idrowMatnr);
				oEAN.setValue(sEanValue);
				oMatnr.setValue(sMaterialValue);
				MessageToast.show("Material Number is identified..");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		vhCustMatnrSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Kdmat", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		vhCustMatnrConfrim: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts) {
				var oRow = aContexts[0].getObject();
				var sCustMatValue = oRow.Kdmat;
				var sMaterialValue = oRow.Matnr;

				var oCustMatnr = sap.ui.getCore().byId(this.idCustMatnr);
				var oMatnr = sap.ui.getCore().byId(this.idrowMatnr);
				oCustMatnr.setValue(sCustMatValue);
				oMatnr.setValue(sMaterialValue);
				MessageToast.show("Material Number is identified..");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		vhSoldToPartySearch: function(oEvent) {
			//search in dialog
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Kunnr", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		vhShipToPartySearch: function(oEvent) {
			//search in dialog
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Kunnr", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		onVHMaterial: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			//Call F4 Dialog
			var oRow = oEvent.getSource().getParent();
			if (oRow) {
				var oCells = oRow.getAggregation("cells");
				//matnr Column cell
				this.idEAN = oCells[3].getId();
				this.idCustMatnr = oCells[2].getId();
			}
			this.sMatnrId = oEvent.getSource().getId();
			if (!this._oVHMatnr) {

				this._oVHMatnr = sap.ui.xmlfragment("comZSAPR.fragment.VHMaterial", this);
				this.getView().addDependent(this._oVHMatnr);

				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oVHMatnr);
			}
			this._oVHMatnr.getBinding("items").filter([new Filter("Matnr", sap.ui.model.FilterOperator.Contains, sValue)]);
			this._oVHMatnr.open(sValue);
		},
		vhMatnrSearch: function(oEvent) {
			//search in dialog
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Matnr", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		vhMatnrConfrim: function(oEvent) {
			//confirm in dialog
			var oSelItem = oEvent.getParameter("selectedItem");
			if (oSelItem) {
				var oInput = sap.ui.getCore().byId(this.sMatnrId);
				oInput.setValue(oSelItem.getTitle());
				var oCustMatnr = sap.ui.getCore().byId(this.idCustMatnr);
				oCustMatnr.setValue("");
				var oEAN = sap.ui.getCore().byId(this.idEAN);
				oEAN.setValue("");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		vhDocTypeSearch: function(oEvent) {
			//search in Doctype dialog
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Auart", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		vhSaleOrgSearch: function(oEvent) {
			//search in Sales Org dialog
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Vkorg", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		vhDistributionChnlSearch: function(oEvent) {

			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Vtweg", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		vhDivisionSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Spart", sap.ui.model.FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		vhSoldToPartyConfirm: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			//confirm in dialog
			if (aContexts) {
				var oRow = aContexts[0].getObject();
				var sValue = oRow.Kunnr;
				var oInput = this.byId(this.sSol2partId);
				oInput.setValue(sValue);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		vhDivisionConfrim: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts) {
				var oRow = aContexts[0].getObject();
				var sValue = oRow.Spart;
				var oInput = this.byId(this.sDivision);
				oInput.setValue(sValue);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		vhShipToPartyConfirm: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts) {
				var oRow = aContexts[0].getObject();
				var sValue = oRow.Kunnr;
				var oInput = this.byId(this.sShp2partId);
				oInput.setValue(sValue);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		vhDocTypeConfirm: function(oEvent) {
			var oSelItem = oEvent.getParameter("selectedItem");
			if (oSelItem) {
				var oInput = this.byId(this.sDocType);
				oInput.setValue(oSelItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		vhSaleOrgConfrim: function(oEvent) {
			var oSelItem = oEvent.getParameter("selectedItem");
			if (oSelItem) {
				var oInput = this.byId(this.sSalesOrg);
				oInput.setValue(oSelItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		vhDistributionChnlConfrim: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts) {
				var oRow = aContexts[0].getObject();
				var sValue = oRow.Vtweg;
				var oInput = this.byId(this.sDisChnl);
				oInput.setValue(sValue);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		onQuanUpdate: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			if (sValue > 0) {
				oEvent.getSource().setValueState("None");
			}
		}
	});
});