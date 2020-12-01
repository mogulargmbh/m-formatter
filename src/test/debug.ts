import { FormatError } from '../main';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import * as clipboard from 'clipboardy';
import { format } from '../formatter';
import { getCases, getConnectorCases } from './common';


// let cases = getCases();
// let code = cases[35];


let connectorCases = getConnectorCases();
let c = connectorCases.find(c => c.identifier == "SqlODBC.pq");
let code = c.code;

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
