import { FormatError } from '../main';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import * as clipboard from 'clipboardy';
import { format } from '../formatter';
import { getCases, getConnectorCases } from './common';


// let cases = getCases();
// let code = cases[1];
// let connectorCases = getConnectorCases();
// let c = connectorCases.find(c => c.name == "HiveSample.pq");
// let code = c.code;

let code = `
section HiveSample;
// When set to true, additional trace information will be written out to the User log.
  // This should be set to false before release. Tracing is done through a call to
  // Diagnostics.LogValue(). When EnableTraceOutput is set to false, the call becomes a
  // no-op and simply returns the original value.
  EnableTraceOutput = false;`
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
