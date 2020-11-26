import { FormatError } from '../main';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import * as clipboard from 'clipboardy';
import { format } from '../formatter';
import { getCases, getConnectorCases } from './common';


// let cases = getCases();
// let code = cases[35];


// let connectorCases = getConnectorCases();
// let c = connectorCases.find(c => c.name == "SqlODBC.pq");
// let code = c.code;

let code = `
section SqlODBC;
[DataSource.Kind="SqlODBC", Publish="SqlODBC.Publish"]
shared SqlODBC.Contents = (server as text) =>
    let
                                ConnectionString = [
            Driver = Config_DriverName,

                        Server = server,
            ApplicationIntent = "readonly"
        ],

                                                                Credential = Extension.CurrentCredential(),
		CredentialConnectionString =
            if Credential[AuthenticationKind]? = "UsernamePassword" then
                                [ UID = Credential[Username], PWD = Credential[Password] ]
            else if (Credential[AuthenticationKind]? = "Windows") then
                                [ Trusted_Connection="Yes" ]
            else
                error Error.Record("Error", "Unhandled authentication kind: " & Credential[AuthenticationKind]?),
        
                                defaultConfig = Diagnostics.LogValue("BuildOdbcConfig", BuildOdbcConfig()),

        SqlCapabilities = Diagnostics.LogValue("SqlCapabilities_Options", defaultConfig[SqlCapabilities] & [
                        FractionalSecondsScale = 3
        ]),

                        SQLGetInfo = Diagnostics.LogValue("SQLGetInfo_Options", defaultConfig[SQLGetInfo] & [
                        SQL_SQL92_PREDICATES = ODBC[SQL_SP][All],
            SQL_AGGREGATE_FUNCTIONS = ODBC[SQL_AF][All]
        ]),

                                                                                                        SQLGetTypeInfo = (types) => 
            if (EnableTraceOutput <> true) then types else
            let
                                                rows = Table.TransformRows(types, each Diagnostics.LogValue("SQLGetTypeInfo " & _[TYPE_NAME], _)),
                toTable = Table.FromRecords(rows)
            in
                Value.ReplaceType(toTable, Value.Type(types)),                

                                                                                        SQLColumns = (catalogName, schemaName, tableName, columnName, source) =>
            if (EnableTraceOutput <> true) then source else
                        if (Diagnostics.LogValue("SQLColumns.TableName", tableName) <> "***" and Diagnostics.LogValue("SQLColumns.ColumnName", columnName) <> "***") then
                let
                                                            rows = Table.TransformRows(source, each Diagnostics.LogValue("SQLColumns", _)),
                    toTable = Table.FromRecords(rows)
                in
                    Value.ReplaceType(toTable, Value.Type(source))
            else
                source,

        OdbcDatasource = Odbc.DataSource(ConnectionString, [
                        HierarchicalNavigation = true, 
                        HideNativeQuery = true,
                        SoftNumbers = true,
                        TolerateConcatOverflow = true,
                        ClientConnectionPooling = true,

                        CredentialConnectionString = CredentialConnectionString,
            SqlCapabilities = SqlCapabilities,
            SQLColumns = SQLColumns,
            SQLGetInfo = SQLGetInfo,
            SQLGetTypeInfo = SQLGetTypeInfo
        ])
    in
        OdbcDatasource;  


`

test(code);

function test(code: string)
{
  try
  {
    let serializer = new HtmlAstSerializer();
    let formatted = format(code);
    let res = serializer.serialize(formatted, {
      debugMode: true
    });
    console.log(res);
    clipboard.writeSync(res);
  }
  catch(error)
  {
    if(error instanceof FormatError)
      throw error;
    else 
      throw new FormatError("Could not format code", "FORMATTER_ERROR", error);
  }
}
