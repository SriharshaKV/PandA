sap.ui.define([], function() {
	"use strict";
	return {
		netPriceFormatter: function(Netwr, Waerk) {
			var word = Netwr + "  " + Waerk;

			return word;
		},
		getReturnable: function(value) {
			if (value === "X") {
				return "Yes";
			} else {
				return "No";
			}
		},
		setDateFormat: function(sdate) {
			if (sdate !== null && sdate !== undefined) {
				if (sdate.length > 0) {
					var Y = sdate.slice(0, 4);
					var M = sdate.slice(4, 6);
					var D = sdate.slice(6, 8);
					var Date1 = M + "." + D + "." + Y;
				}
			}
			return Date1;
		},
		getMessageType: function(stype) {
			if (stype === "E") {
				var messType;
				messType = "Error";

			} else {
				messType = "Error";
			}
			return messType;

		},
		setMediumDate: function(sDate) {
			// if(){}
			if (sDate !== null && sDate !== undefined) {
				if (sDate.length > 0) {
					var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November",
						"December"
					];
					var oDate = new Date(sDate.slice(0, 4), sDate.slice(4, 6) - 1, sDate.slice(6, 8));
					var D = oDate.getDate();
					var M = months[oDate.getMonth()];
					var Y = oDate.getFullYear();
					var fullDate = M + " " + D + ", " + Y;
					return fullDate;
				}
			}
		},
		getYYYYMMDD: function(sdate) {
			if (sdate !== null) {
				var M = sdate.getMonth() + 1;
				if (M <= 9) {
					M = "0" + M;
				}

				var D = sdate.getDate();
				if (D <= 9) {
					D = "0" + D;
				}
				var Y = sdate.getFullYear();

				var sdate2 = Y.toString() + M.toString() + D.toString();
			}
			return sdate2;
		},
		setRowSetting: function(msgType) {
			if (msgType === "E") {
				return "Error";
			} else if (msgType === "W") {
				return "Warning";
			} else if (msgType === "I") {
				return "Information";
			} else {
				return "None";
			}
		},
		concatPlantname: function(Code1, desc) {
			var plantComplete;
			plantComplete = desc + " (" + Code1 + ")";
			return plantComplete;

		},
		concatMatnrname: function(matnr, desc) {

		},

		logMessage: function(msg) {
			return "Message";
		},
		checkUser: function() {
			var SESA = sap.ushell.Container.getService("UserInfo").getId();
			if (SESA === "SESA289707") {
				// if (SESA === "SESA566852" || window.URI().hostname() === "localhost") {
				return true;
			} else if (SESA === "SESA566852") {
				return true;
			} else if (SESA === "SESA210858") {
				return true;
			} else {

				return false;
			}

		},
		calculateAvailability: function(partialValue, totalValue) {
			var nAvailability = (100 * partialValue) / totalValue;
			return nAvailability.toFixed(2);
		},
		calculateAvailabilityDisplay: function(partialValue, totalValue) {
			var nAvailability = (100 * partialValue) / totalValue;
			var nAvail2 = nAvailability.toFixed(2);
			return nAvail2 + "%";
		},
		calculateState: function(partialValue, totalValue) {
			var percentage = (100 * partialValue) / totalValue;
			if (percentage === 100) {
				return "Success";
			} else if (percentage < 100 && percentage >= 50) {
				return "Warning";
			} else if (percentage < 50) {
				return "Error";
			}
		}
	};
});