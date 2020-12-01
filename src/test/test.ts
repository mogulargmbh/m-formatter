
import { getCases, getConnectorCases } from './common';
import * as HtmlTest from "./HtmlSerializer.test"
import * as TxtTest from "./TextSerializer.test"

async function main()
{
  let cases = [
    ...getCases(),
    ...getConnectorCases()
  ];
  
  let errors = 0;
  errors += HtmlTest.runTests(cases);
  errors += TxtTest.runTests(cases);
  
  console.log(`Tests finished, errors: ${errors}`);
}

main()
  .then(() => console.log("exit"))
  .catch(e => console.error(e));