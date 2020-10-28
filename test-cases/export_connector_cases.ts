import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

let pattern = path.join(process.env["PROJECT_DIR"], "/test-projects/DataConnectors/**/*.pq");
let outDir = path.join(__dirname, "ms_connector");

async function main()
{
  if(fs.existsSync(outDir) == false)
    await fs.mkdirSync(outDir);
    
  let files = await new Promise<string[]>((resolve, reject) => {
    glob(pattern, { absolute: true}, (err, files) => {
      if(err)
        reject(err);
      else
        resolve(files);
    });
  });
  
  for(let f of files)
  {
    // let o = await getUniqueFilename(path.join(outDir, path.basename(f)));
    let o = path.join(outDir, path.basename(f));
    await fs.copyFileSync(f, o);
  }
}

main().then(() => console.log("Fin"));
