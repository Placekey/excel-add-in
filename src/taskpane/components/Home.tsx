import { Button, Checkbox, Divider, Form, Modal, Select, Spin, Typography } from "antd";
import * as React from "react";
import ReactDOM = require("react-dom");
import Auth from "./Auth";
import { FormInstance } from "antd/lib/form";
import axioConnectorInstance from "../../services/AxioConnector";

const { Title } = Typography;

const { Option } = Select;

export interface HomeProps {}

export interface HomeState {
  columns: any[];
  allSheets: any[];
  activeSheet: string;
  rangeOfSheet: string;
  isDataLoading: boolean;
  isEmptyDataView: string;
  isFillDataView: string;
  streetColumn: string;
  cityColumn: string;
  regionColumn: string;
  postalCodeColumn: string;
  locationNameColumn: string;
  latitudeColumn: string;
  longitudeColumn: string;
  countryColumn: string;
  isAddressMatch: boolean;
  isNameMatch: boolean;
  isInsertError: boolean;
  isOverwrite: boolean;

  overWriteDisabled: boolean;

  isGenerateButtonDisabled: boolean;
  progressMessage: string;

  rowsData : any[];
  rowCount: number;
  columnCount: number;
}

class Home extends React.Component<HomeProps, HomeState> {
  formRef = React.createRef<FormInstance>();

  constructor(props) {
    super(props);
    this.state = {
      columns: ["--"],
      allSheets: [],
      activeSheet: "",
      rangeOfSheet: "",
      isDataLoading: true,
      isEmptyDataView: "none",
      isFillDataView: "none",
      streetColumn: "--",
      cityColumn: "--",
      regionColumn: "--",
      postalCodeColumn: "--",
      locationNameColumn: "--",
      latitudeColumn: "--",
      longitudeColumn: "--",
      countryColumn: "--",
      isAddressMatch: false,
      isNameMatch: false,
      isInsertError: false,
      isOverwrite: false,
      overWriteDisabled: false,
      isGenerateButtonDisabled: false,
      progressMessage: "",
      rowsData: [],
      rowCount: 0,
      columnCount: 0
    };
  }

  async componentDidMount() {
    await this.bindCurrentSheetData();
  }

  getWorkSheets = async () => {
    var that = this;
    var workSheets = [];
    Excel.run(async function(context) {
      var sheets = context.workbook.worksheets;
      sheets.load("items/name");
      return context.sync().then(function() {
        if (sheets.items.length > 1) {
          console.log(`There are ${sheets.items.length} worksheets in the workbook:`);
        } else {
          console.log(`There is one worksheet in the workbook:`);
        }
        sheets.items.forEach(function(sheet) {
          workSheets.push(sheet.name);
        });
        that.setState({ allSheets: workSheets });
        that.getActiveSheet();
      });
    }).catch(this.errorHandlerFunction);
  };

  getActiveSheet = async () => {
    var that = this;
    Excel.run(async function(context) {
      var sheet = context.workbook.worksheets.getActiveWorksheet();
      sheet.load("name");
      return context.sync().then(function() {
        that.checkEmptySheet(sheet.name);
        that.setState({ activeSheet: sheet.name });
      });
    }).catch(this.errorHandlerFunction);
  };

  checkEmptySheet = worksheetName => {
    var that = this;
    Excel.run(function(context) {
      console.log("Hello");
      var range = context.workbook.worksheets
        .getItem(worksheetName)
        .getUsedRange()
        .getRow(0);
      range.load("address");
      return context.sync().then(function() {
        try {
          var lastChars = range.address.substr(range.address.length - 3);
          if (lastChars == "!A1") {
            that.setState({ isEmptyDataView: "block", isDataLoading: false });
          } else {
            that.setState({ rangeOfSheet: range.address });
            that.getRows(worksheetName, range.address);
          }
        } catch (e) {
          that.setState({ isEmptyDataView: "block", isDataLoading: false });
        }
        console.log(range.address);
      });
    }).catch(this.errorHandlerFunction);
  };

  getRows = (worksheetName, rangeVal) => {
    var that = this;
    Excel.run(function(context) {
      var sheet = context.workbook.worksheets.getItem(worksheetName);
      var range = sheet.getRange(rangeVal);
      range.load("values");
      return context.sync().then(function() {
        var lastChars = rangeVal.substr(rangeVal.length - 3);
        if (lastChars != "!A1") {
          var rangeCol = range.values[0];
          var allColumns: any = [];
          if (rangeCol.length > 0) {
            allColumns = that.state.columns.concat(rangeCol);
          } else {
            allColumns = that.state.columns;
          }

          if (allColumns.some(x => x === "Placekey")) {
            that.setState({ isOverwrite: true, overWriteDisabled: false });
          }

          that.setState({ columns: allColumns, isFillDataView: "block", isDataLoading: false });
        }
      });
    }).catch(this.errorHandlerFunction);
  };

  onGenerateSampleData = () => {
    this.setState({ isEmptyDataView: "none", isDataLoading: true, isFillDataView: "block" });
    var that = this;
    Excel.run(function(context) {
      var sheet = context.workbook.worksheets.getItem(that.state.activeSheet);
      var sampleTable = sheet.tables.add("A1:G1", true);

      sampleTable.getHeaderRowRange().values = [
        ["Name", "Street Address", "City", "State", "Zip code", "Latitude", "Longitude"]
      ];

      sampleTable.rows.add(null, [
        ["Twin Peaks Petroleum", "598 Portola Dr", "San Francisco", "CA", "94131", "37.7371", "-122.44283"],
        ["", "", "", "", "", "37.7371", "-122.44283"],
        ["Beretta", "1199 Valencia St", "San Francisco", "CA", "94110", "", ""],
        ["Tasty Hand Pulled Noodle", "1 Doyers St", "New York", "ny", "10013", "", ""],
        ["", "1 Doyers St", "New York", "NY", "10013", "", ""]
      ]);

      if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
        sheet.getUsedRange().format.autofitColumns();
        sheet.getUsedRange().format.autofitRows();
      }

      //sheet.activate();
      that.bindCurrentSheetData();
      that.setState({ isDataLoading: false });
      return context.sync();
    }).catch(this.errorHandlerFunction);
  };

  errorHandlerFunction = error => {
    console.log(error);
  };

  onChangeActiveSheet = value => {
    var that = this;
    console.log(value);
    this.setState({
      activeSheet: value,
      isEmptyDataView: "none",
      isFillDataView: "none",
      isDataLoading: true,
      isOverwrite: false
    });
    Excel.run(function(context) {
      var sheet = context.workbook.worksheets.getItem(value);
      sheet.activate();
      sheet.load("name");
      return context.sync().then(function() {
        console.log(`The active worksheet is "${sheet.name}"`);
        that.bindCurrentSheetData();
      });
    }).catch(this.errorHandlerFunction);
  };

  bindCurrentSheetData = async () => {
    const authKey = Office.context.document.settings.get("placeKeyToken");
    if (authKey) {
      if (authKey) {
        this.setState({ columns: [] });
        await this.getWorkSheets();
      }
    } else {
    }
  };

  render() {
    const onViewDoc = () => {
      window.open("https://docs.placekey.io/", "_blank");
    };

    const onChangeAPIKey = () => {
      ReactDOM.render(<Auth />, document.getElementById("container"));
    };

    const onAddressChange = e => {
      this.setState({ isAddressMatch: e.target.checked });
    };

    const onNameMatchChange = e => {
      this.setState({ isNameMatch: e.target.checked });
    };

    const onInssertErrorChange = e => {
      this.setState({ isInsertError: e.target.checked });
    };

    const onOverwriteChange = e => {
      this.setState({ isOverwrite: e.target.checked });
    };

    const onGeneratePlaceKey = async () => {
      this.setState({ isGenerateButtonDisabled: true });
      if (
        (this.state.streetColumn == "--" || this.state.regionColumn == "--") &&
        (this.state.latitudeColumn == "--" || this.state.longitudeColumn == "--")
      ) {
        Modal.warning({
          title: "Placekey",
          content: "Please select either latitude and longitude or street address and state",
          width: "85%"
        });
        this.setState({ isGenerateButtonDisabled: false });
        return false;
      }
      let columns = [];
      columns.push(
        this.state.streetColumn,
        this.state.cityColumn,
        this.state.regionColumn,
        this.state.postalCodeColumn,
        this.state.locationNameColumn,
        this.state.latitudeColumn,
        this.state.longitudeColumn,
        this.state.countryColumn
      );
      for (var k = 0; k < columns.length; k++) {
        if (columns[k] != "--" && columns[k] != true && columns[k] != false) {
          var count = countInArray(columns, columns[k]);
          console.log(count);
          if (count > 1) {
            Modal.warning({
              title: "Placekey",
              content: "The same column is mapped to more than one field. Please map only one column per field.",
              width: "85%"
            });
            this.setState({ isGenerateButtonDisabled: false });
            return false;
          }
        }
      }

      this.setState({ progressMessage: "Working..." });

      setTimeout(() => this.setState({ progressMessage: "Please wait..." }), 1000);

      columns.push(this.state.isAddressMatch, this.state.isNameMatch, this.state.isOverwrite, this.state.isInsertError);

      await generatePlaceKeys(columns);

      this.setState({ isGenerateButtonDisabled: false });
      return false;
    };

    const generatePlaceKeys = async columns => {
      var that = this;
      let rowCount = 0;
      let columnCount = 0;

      Excel.run(function(context) {
        let sheet = context.workbook.worksheets.getItem(that.state.activeSheet);
        let uRange = sheet.getUsedRange();
        uRange.load(["rowCount", "columnCount"]);

        return context.sync().then(function() {
          rowCount = uRange.rowCount;
          columnCount = uRange.columnCount;
          that.setState({rowCount: rowCount, columnCount: columnCount})
          getRows(rowCount, columnCount, columns);
        });
      }).catch(this.errorHandlerFunction);
    };

    const getRows = (rowCount, columnCount, columns) => {
      var that = this;
      Excel.run(function(context) {
        let sheet = context.workbook.worksheets.getItem(that.state.activeSheet);
        let columnLetter: string = numberToLetter(columnCount);
        var range = sheet.getRange("A2:"+columnLetter+rowCount);
        range.load("values");

        return context.sync().then(function() {
          var rows = range.values;
          that.setState({rowsData: range.values});
          placeKeyAPIAndInsertData(rowCount, columnCount, rows, columns);
        });
      }).catch(this.errorHandlerFunction);
    }

    const placeKeyAPIAndInsertData = (rowCount, columnCount, rows, columns) =>{
      var that = this;
      Excel.run(function(context) {
        let sheet = context.workbook.worksheets.getItem(that.state.activeSheet);

        var range = sheet.getRange(that.state.rangeOfSheet);
        range.load("values");

        let colsId = [];
        let key = [
          "street_address",
          "city",
          "region",
          "postal_code",
          "location_name",
          "latitude",
          "longitude",
          "iso_country_code"
        ];
        var PlacekeyColumnId = 0;

        sheet.load("name");
        return context.sync().then(async function() {
          var rangeCol = range.values[0];

          console.log(rangeCol);

          for (var i = 0; i < columns.length - 2; i++) {
            for (var j = 0; j < columnCount; j++) {
              if (columns[i] == rangeCol[j]) {
                colsId.push(j);
                break;
              }
              if (columns[i] == "--") {
                colsId.push("--");
                break;
              }
            }
          }

          for (var j = 0; j < columnCount; j++) {
            if (rangeCol[0][j] == "Placekey") {
              PlacekeyColumnId = j;
              break;
            }
          }

          // Check if there are more than 90 records on the sheet and prepare chunks

          var chunks = [];

          var divided = rowCount / 90;
          var floorDivided = Math.ceil(divided);
          for (var j = 0; j < floorDivided; j++) {
            if (j + 1 == floorDivided) {
              // information in chunks for each item contains: [where it starts, where it ends, how many in chunk]

              chunks[j] = [
                j * 90,
                j * 90 + (rowCount - (floorDivided - 1) * 90) - 1,
                rowCount - (floorDivided - 1) * 90 - 1
              ];
            } else {
              chunks[j] = [j * 90, j * 90 + 90, 90];
            }
          }

          console.log(chunks);
          var totalPlaceKeys = 0;

          // start looking at chunks of rows

          for (var v = 0; v < chunks.length; v++) {
            console.log(chunks[v][0]);
            console.log(chunks[v][1]);

            var data = {
              queries: [],
              options: {
                strict_address_match: columns[8],
                strict_name_match: columns[9]
              }
            };
            var problematicRows = [];
            var y = 0;
            //var start = chunks[v][0];
            //var end = chunks[v][1];
            var eachRowResponse = [];
            var errors = [];
            var parsed = null;

            setTimeout(() => {
              console.log("chunck calling");
            }, 1000);

            var countProblem = -1;

            // processing specific chunk and building queries for each row

            for (var k = chunks[v][0]; k < chunks[v][1]; k++) {
              countProblem++;
              // If there are empty cells in a row, that's problematic, Bulk API will not process any query if there is one problematic.
              // therfore, we will check and exclude those rows before requesting for Placekeys.
              console.log(
                rows[k][colsId[0]],
                rows[k][colsId[1]],
                rows[k][colsId[2]],
                rows[k][colsId[3]],
                rows[k][colsId[5]],
                rows[k][colsId[6]]
              );
              if (
                (rows[k][colsId[0]] == "" ||
                  rows[k][colsId[2]] == "" ||
                  rows[k][colsId[0]] == null ||
                  rows[k][colsId[2]] == null) &&
                (rows[k][colsId[5]] == "" ||
                  rows[k][colsId[6]] == "" ||
                  rows[k][colsId[5]] == null ||
                  rows[k][colsId[6]] == null)
              ) {
                problematicRows[k] = countProblem;

                continue;
              }
              data.queries[y] = {};

              // continue bulding queries, some values need to be placed as integer

              for (var n = 0; n < colsId.length; n++) {
                if (rows[k][colsId[n]] != "" && colsId[n] != "--") {
                  data.queries[y][key[n]] = {};

                  if (key[n] == "latitude" || key[n] == "longitude") {
                    data.queries[y][key[n]] = parseFloat(rows[k][colsId[n]]);
                  } else {
                    data.queries[y][key[n]] = rows[k][colsId[n]];
                  }
                }
              }
              if (rows[k][colsId[7]] == null || rows[k][colsId[7]] == "") {
                data.queries[y]["iso_country_code"] = "US";
              }

              data.queries[y]["query_id"] = k + "1";
              y = y + 1;
            }
            console.log(data);

            // Finish building queries ^^^^^^^^
            // start requesting for Placekeys

            const authKey = Office.context.document.settings.get("placeKeyToken");
            var API_Key = authKey;
            var params = {   
              headers: {
                apikey: API_Key,
                muteHttpExceptions: true
              }
            };
            var response: any = await axioConnectorInstance.post("/placekeys", data, params);

            console.log(response);
            var parsed = JSON.parse(response);
            var eachRowResponse = [];
            var errors = [];
            //var totalPlaceKeys = 0;
            console.log("parsed response" + response);
            console.log("code response" + response.getResponseCode());

            try {
              if (response.getResponseCode() == 429) {
                v = v - 1;
                setTimeout(() => {
                  console.log("chunck calling");
                }, 5000);
                continue;
              }
            } catch (e) {}

            // All batch error replacment

            if (response.getResponseCode() == 400) {
              for (var i = 0; i < chunks[v][1] - chunks[v][0]; i++) {
                if (1 == 1) {
                  if (columns[11] == false) {
                    eachRowResponse[i] = ["Invalid address"];
                  } else {
                    eachRowResponse.splice(i, 0, [""]);
                    errors[i] = ["Invalid address"];
                  }
                } else {
                  totalPlaceKeys = totalPlaceKeys + 1;

                  if (columns[11] == false) {
                    eachRowResponse[i] = ["Invalid address"];
                  } else {
                    eachRowResponse[i] = ["Invalid address"];

                    errors.splice(i, 0, [""]);
                  }
                }
              }
            }
            //^^^^^^^^^^^^^^^^^^^^^^^^^^^
            for (var i = 0; i < parsed.length; i++) {
              if (parsed[i]["placekey"] == null) {
                if (columns[11] == false) {
                  eachRowResponse[i] = [parsed[i]["error"]];
                } else {
                  eachRowResponse.splice(i, 0, [""]);
                  errors[i] = [parsed[i]["error"]];
                }
              } else {
                totalPlaceKeys = totalPlaceKeys + 1;

                if (columns[11] == false) {
                  eachRowResponse[i] = [parsed[i]["placekey"]];
                } else {
                  eachRowResponse[i] = [parsed[i]["placekey"]];

                  errors.splice(i, 0, [""]);
                }
              }
            }

            console.log(problematicRows);
            console.log("row response: " + eachRowResponse);
            console.log("error: " + errors);

            // We insert problematic rows to final result

            for (var i = 0; i < problematicRows.length; i++) {
              if (problematicRows[i] == null) {
                continue;
              }
              if (columns[11] == false) {
                eachRowResponse.splice(problematicRows[i], 0, ["Incomplete address"]);
              } else {
                errors.splice(problematicRows[i], 0, ["Incomplete address"]);
                eachRowResponse.splice(problematicRows[i], 0, [""]);
              }
            }
            console.log("row response: " + eachRowResponse);
            console.log("error: " + errors);

            // If there is not we create one column and insert result.

            // if (PlacekeyColumnId == 0 || columns[10] == false) {
            //   try {
            //     console.log(chunks[v][0] + 2);
            //     console.log(chunks[v][1]);
            //     console.log(columnCount);
            //     var ss = context.workbook.worksheets.getItem(that.state.activeSheet);
            //     var range = ss.getRange(start + 2, columnCount + 1, chunks[v][2], 1);
            //     range.setValues(eachRowResponse);
            //     if (columns[11] == true) {
            //       ss.getRange(1, columnCount + 2).setValue("Errors");
            //       ss.getRange(chunks[v][0] + 2, columnCount + 2, chunks[v][2], 1).setValues(errors);
            //     }
            //   } catch (e) {
            //     // SpreadsheetApp.getUi().alert(e);

            //     if (columns[11] == false) {
            //       ss.getRange(chunks[v][0] + 2, columnCount + 1, chunks[v][2] + 2, 1).setValue(parsed["message"]);
            //     } else {
            //       ss.getRange(chunks[v][0] + 2, columnCount + 2, chunks[v][2] + 2, 1).setValue(parsed["message"]);
            //     }
            //   }
            // } else {
            //   try {
            //     if (columns[11] == false) {
            //       ss.getRange(chunks[v][0] + 2, PlacekeyColumnId + 1, chunks[v][2], 1).setValues(eachRowResponse);
            //     } else {
            //       ss.getRange(chunks[v][0] + 2, PlacekeyColumnId + 1, chunks[v][2], 1).setValues(eachRowResponse);
            //       ss.getRange(chunks[v][0] + 2, PlacekeyColumnId + 2, chunks[v][2], 1).setValues(errors);
            //     }
            //   } catch (e) {
            //     //  totalPlaceKeys = 0;
            //     if (columns[11] == false) {
            //       ss.getRange(chunks[v][0] + 2, PlacekeyColumnId + 1, chunks[v][2], 1).setValue(parsed["message"]);
            //     } else {
            //       ss.getRange(chunks[v][0] + 2, PlacekeyColumnId + 2, chunks[v][2], 1).setValue(parsed["message"]);
            //     }
            //   }
            // }
          }

          if (PlacekeyColumnId == 0 || columns[10] == false) {
            Excel.run(function(context) {
              let sheet = context.workbook.worksheets.getItem(that.state.activeSheet);

              let lastColumnLetter = numberToLetter(columnCount + 1);

              var range = sheet.getRange(lastColumnLetter + "1");
              range.values = [["Placekey"]];
              range.format.autofitColumns();

              return context.sync();
            }).catch(that.errorHandlerFunction);
          }

          console.log(`The problemetic row is "${problematicRows}"`);
          console.log(`The key row is "${key}"`);
          console.log(`The placekeycolumn row is "${PlacekeyColumnId}"`);
          console.log(`The row is "${rowCount}"`);
          console.log(`The column is "${columnCount}"`);
          console.log(`The worksheet is "${sheet.name}"`);
        });
      }).catch(this.errorHandlerFunction);
    }

    const numberToLetter = num => {
      if (num < 1 || num > 26 || typeof num !== "number") {
        return "";
      }
      const leveller = 64;
      //since actually A is represented by 65 and we want to represent it
      return String.fromCharCode(num + leveller);
    };

    const countInArray = (array, what) => {
      var count = 0;
      for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
          count++;
        }
      }
      return count;
    };

    return (
      <div className="placekey-container">
        <div id="sampleDataInput" style={{ marginTop: "10px", display: this.state.isEmptyDataView }}>
          <span style={{ fontWeight: 600 }}>This Sheet looks empty.</span>
          <br /> Fill with sample data?
          <div style={{ textAlign: "center", paddingTop: "10px" }}>
            <Button
              onClick={this.onGenerateSampleData}
              htmlType="submit"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.897)",
                color: "white",
                margin: "3px",
                borderRadius: "5px",
                width: "95%"
              }}
            >
              Fill with sample data
            </Button>
          </div>
        </div>
        <div id="generateData" style={{ display: this.state.isFillDataView }}>
          <Form name="map-columns" ref={this.formRef}>
            <p style={{ marginTop: "0px", marginBottom: "10px", fontWeight: "bold" }}>Data Location:</p>
            <Form.Item name="sheetName">
              <label>Sheets</label>
              <Select
                defaultValue={this.state.activeSheet}
                value={this.state.activeSheet}
                onChange={this.onChangeActiveSheet}
              >
                {this.state.allSheets.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Title level={5}>Match the headers in your document to the fields below.</Title>
            <Form.Item name="streetAddress">
              <label>
                Street Address <i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. 598 Portola Dr </i>
              </label>
              <Select
                defaultValue={this.state.streetColumn}
                value={this.state.streetColumn}
                onChange={value => {
                  this.setState({ streetColumn: value });
                }}
              >
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="city">
              <label>
                City<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. San Fransisco</i>
              </label>
              <Select
                defaultValue={this.state.cityColumn}
                value={this.state.cityColumn}
                onChange={value => {
                  this.setState({ cityColumn: value });
                }}
              >
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="region">
              <label>
                Region<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. California or CA</i>
              </label>
              <Select
                defaultValue={this.state.regionColumn}
                value={this.state.regionColumn}
                onChange={value => {
                  this.setState({ regionColumn: value });
                }}
              >
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="postalCode">
              <label>
                Postal Code<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. 94131</i>
              </label>
              <Select
                defaultValue={this.state.postalCodeColumn}
                value={this.state.postalCodeColumn}
                onChange={value => {
                  this.setState({ postalCodeColumn: value });
                }}
              >
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="location">
              <label>
                Location Name<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. Twin Peaks Petroleum</i>
              </label>
              <Select
                defaultValue={this.state.locationNameColumn}
                value={this.state.locationNameColumn}
                onChange={value => {
                  this.setState({ locationNameColumn: value });
                }}
              >
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="latitude">
              <label>
                Latitude<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. 37.7371</i>
              </label>
              <Select
                defaultValue={this.state.latitudeColumn}
                value={this.state.latitudeColumn}
                onChange={value => {
                  this.setState({ latitudeColumn: value });
                }}
              >
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="longitude">
              <label>
                Longitude<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. -122.44283</i>
              </label>
              <Select
                defaultValue={this.state.longitudeColumn}
                value={this.state.longitudeColumn}
                onChange={value => {
                  this.setState({ longitudeColumn: value });
                }}
              >
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="country">
              <label>
                Country<i style={{ color: "#696464", paddingLeft: "9px" }}>- e.g. US</i>
              </label>
              <Select
                defaultValue={this.state.countryColumn}
                value={this.state.countryColumn}
                onChange={value => {
                  this.setState({ countryColumn: value });
                }}
              >
                {this.state.columns.map((item, index) => {
                  return (
                    <Option value={item} key={index}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
              <Checkbox
                onChange={onAddressChange}
                checked={this.state.isAddressMatch}
                name="addressMatch"
                style={{ padding: "5px" }}
              >
                {" "}
                Check for exact address matches only
              </Checkbox>
              <Checkbox
                onChange={onNameMatchChange}
                checked={this.state.isNameMatch}
                name="nameMatch"
                style={{ padding: "5px" }}
              >
                {" "}
                Check for exact name matches only
              </Checkbox>
              <Checkbox
                onChange={onInssertErrorChange}
                checked={this.state.isInsertError}
                name="insertError"
                style={{ padding: "5px" }}
              >
                {" "}
                Insert errors in new column
              </Checkbox>
              <Checkbox
                onChange={onOverwriteChange}
                disabled={this.state.overWriteDisabled}
                checked={this.state.isOverwrite}
                name="overwritePlacekey"
                style={{ padding: "5px" }}
              >
                {" "}
                <span style={{ fontWeight: "bolder" }}>Overwrite existing Placekey column</span>
              </Checkbox>
            </div>
            <div style={{ textAlign: "center" }}>
              <Button
                disabled={this.state.isGenerateButtonDisabled}
                onClick={onGeneratePlaceKey}
                htmlType="submit"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.897)",
                  color: "white",
                  margin: "3px",
                  borderRadius: "5px",
                  width: "95%"
                }}
              >
                Generate Placekeys
              </Button>
            </div>
            <br />
            <div id="generateToast" style={{ fontStyle: "itali", color: "#484852", marginLeft: "8px" }}>
              {this.state.progressMessage}
            </div>
          </Form>
        </div>
        <div>
          {this.state.isDataLoading && (
            <div className="centeredSpinner">
              <Spin />
            </div>
          )}
          <div>
            <Form name="basic">
              <Form.Item style={{ marginTop: "20px" }}>
                <Button
                  type="link"
                  onClick={onViewDoc}
                  style={{
                    float: "left",
                    borderRadius: "5px"
                  }}
                >
                  View API Docs
                </Button>
                <Button
                  type="link"
                  onClick={onChangeAPIKey}
                  style={{
                    float: "right",
                    borderRadius: "5px"
                  }}
                >
                  Change API Key
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <Divider style={{ backgroundColor: "black", marginBottom: "30px", width: "85%" }} />
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 23" width="80" height="25" style={{ float: "right" }}>
            <path d="M78.5 23h-76C1.1 23 0 21.9 0 20.5v-18C0 1.1 1.1 0 2.5 0h76C79.9 0 81 1.1 81 2.5v18c0 1.4-1.1 2.5-2.5 2.5z"></path>
            <path
              d="M70.3 8.5l2.2 4.3 1.9-4.3H77l-5.6 11h-2.5l2.4-4.6-3.5-6.4h2.5zm-61.6-5c2.6 0 4.7 2.1 4.7 4.7s-4.3 8.5-4.7 8.5S4 10.8 4 8.2s2.1-4.7 4.7-4.7zm24.4 4.8c.5 0 1 .1 1.5.3.4.2.8.5 1.1.8v-.9h2.2v7.3h-2.2v-1c-.3.4-.7.7-1.1.9-.4.2-.9.3-1.4.3-.7 0-1.3-.2-1.8-.5s-1-.8-1.3-1.4c-.3-.6-.5-1.3-.5-2s.2-1.4.5-2c.3-.6.7-1 1.3-1.4.4-.2 1-.4 1.7-.4zm9.5 0c.5 0 .9.1 1.4.2s.8.3 1 .5l-.7 1.5c-.4-.3-.8-.4-1.3-.4s-.8.1-1.1.3c-.3.2-.6.5-.7.8-.2.3-.2.7-.2 1 0 .4.1.7.3 1.1.2.3.4.6.7.8.3.2.7.3 1.1.3.3 0 .5 0 .7-.1l.6-.3.7 1.5c-.3.2-.6.4-1 .5h-1.5c-.6 0-1.1-.1-1.6-.3s-.9-.5-1.3-.8c-.4-.4-.7-.8-.9-1.2-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5c.2-.5.5-.9.9-1.2s.8-.6 1.3-.9 1.1-.3 1.6-.3zm6.4 0c.8 0 1.4.2 2 .5s1 .8 1.3 1.3c.3.6.5 1.2.5 2v.5h-5.6c0 .4.1.7.3 1 .2.3.4.5.7.6.3.2.7.2 1.1.2.4 0 .7-.1 1-.2.3-.1.6-.4.8-.7l1.6.8c-.3.6-.8 1.1-1.5 1.4-.6.3-1.3.5-2.1.5s-1.5-.2-2.1-.5c-.6-.3-1.1-.8-1.5-1.4-.4-.6-.5-1.2-.5-2 0-.5.1-1 .3-1.5.2-.5.5-.9.9-1.2.4-.4.8-.6 1.3-.8.4-.4.9-.5 1.5-.5zm15.7 0c.8 0 1.4.2 2 .5s1 .8 1.3 1.3c.3.6.5 1.2.5 2v.5h-5.6c0 .4.1.7.3 1 .2.3.4.5.7.6.3.2.7.2 1.1.2.4 0 .7-.1 1-.2.3-.1.6-.4.8-.7l1.6.8c-.3.6-.8 1.1-1.5 1.4-.6.3-1.3.5-2.1.5s-1.5-.2-2.1-.5c-.6-.3-1.1-.8-1.5-1.4-.4-.6-.5-1.2-.5-2 0-.5.1-1 .3-1.5.2-.5.5-.9.9-1.2.4-.4.8-.6 1.3-.8.4-.4.9-.5 1.5-.5zM21.9 4.1c.8 0 1.4.1 2 .4.6.3 1.1.7 1.4 1.2s.5 1.2.5 2-.2 1.4-.5 2c-.3.6-.8 1-1.4 1.3-.6.3-1.3.4-2 .4h-1.7v4.5h-2.3V4.1h4zm6.8-.1v11.9h-2.2V4h2.2zm27.1 0v7.2l2.7-2.7h2.8l-3.6 3.6 3.7 3.7h-2.8l-2.9-2.9v2.9h-2.2V4h2.3zm-22 6.2c-.4 0-.7.1-1 .3-.3.2-.5.4-.7.7s-.3.7-.3 1 .1.7.3 1c.2.3.4.5.7.7.3.2.6.3 1 .3s.7-.1 1-.3c.3-.2.5-.4.7-.7.2-.3.2-.7.2-1 0-.4-.1-.7-.3-1s-.4-.5-.7-.7c-.2-.3-.6-.3-.9-.3zM8.7 6.3c-1 0-1.9.9-1.9 1.9 0 .7.4 1.3 1 1.7h.1L7.8 11v.1c0 .5.4.9.9.9h.1c.5 0 .8-.4.8-.9V10c.6-.3 1.1-1 1.1-1.7-.1-1.1-.9-2-2-2zM49 9.9c-.3 0-.6.1-.8.2-.2.1-.4.3-.6.5s-.2.4-.3.7h3.4c0-.3-.1-.5-.3-.7-.2-.2-.4-.4-.6-.5-.2-.2-.5-.2-.8-.2zm15.7 0c-.3 0-.6.1-.8.2-.2.1-.4.3-.6.5s-.3.4-.3.6h3.4c0-.3-.1-.5-.3-.7-.2-.2-.4-.4-.6-.5s-.5-.1-.8-.1zm-43.5-4h-1v3.6h1c.4 0 .8-.1 1.1-.2.3-.1.6-.3.8-.6s.3-.6.3-1-.1-.8-.3-1c-.2-.3-.5-.4-.8-.6-.3-.1-.7-.2-1.1-.2z"
              fill="#fff"
            ></path>
          </svg>
        </div>
      </div>
    );
  }
}

export default Home;
