import { defaultHtmlSerializerConfig } from '../config/default';
import { FormatError } from '../Error';

export function buildTestPage(results: [string|FormatError, number, string][]): string
{
  function *build()
  {
    yield `
<html>
  <head>
    <style>
    body {
      background-color: #1E1E1E;
      color: white;
      font-family: "Lucida Console", Courier, monospace;
      white-space: pre;
    }
    ${defaultHtmlSerializerConfig.inlineCss}
    h3 {
      margin-top: 5px;
      margin-bottom: 5px;
    }
    </style>
  </head>
<body style="position: relative;" onload="load()">
<script>
function load()
{
  let w = document.querySelector("#width");
  let b = document.querySelector("#border");
  let rect = w.getBoundingClientRect();
  b.style.left = rect.width + "px";
  w.style.display = 'none';
}
</script>
<div id="border" style="position: absolute; left: 100em; height: 100%; width: 1px; background-color: red">
</div>
<div><span id="width">${"a".repeat(100)}</span></div>`;
    for(let [r, i, code] of results)
    {
      yield "<h3>" + i + "</h3>";
      yield "<div>";
      if(r instanceof FormatError)
      {
        yield `<div style="color: red">${r.toString()}</div>`;
        yield "Code:<br/>";
        yield code;
      }
      else
      {
        yield r;
      }
      yield "</div>";
      yield "<hr/>";
    }
    yield "</body></html>";
  }
  return Array.from(build()).join("\n");
}
