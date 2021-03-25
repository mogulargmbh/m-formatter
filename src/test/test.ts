
import { getCases, getConnectorCases, TestError } from './common';
import * as HtmlTest from "./HtmlSerializer.test"
import * as TxtTest from "./TextSerializer.test"
import * as fs from "fs";
import "../extensions"
import { Optional } from '../interfaces';
import { IFormatterConfig } from '../main';

let errorDir = TestError.ErrorDir;
if(fs.existsSync(errorDir) == false)
  fs.mkdirSync(errorDir);
  
async function main()
{
  let cases = [
    ...getCases(),
    ...getConnectorCases()
  ];
  
  let errors = 0;
  let formatterConfig: Optional<IFormatterConfig> = {
    wsAfterBrackets: true
  }
  errors += TxtTest.runTests(cases, formatterConfig);
  errors += HtmlTest.runTests(cases, formatterConfig);
  
  console.log(`Tests finished, errors: ${errors}`);
}

main()
  .then(() => console.log("exit"))
  .catch(e => console.error(e));