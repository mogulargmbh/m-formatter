This is not an official microsoft repository. There is an official microsoft [powerquery-formatter](https://github.com/microsoft/powerquery-formatter). This formatter aims to provide more configuration options and minimal unnecessary line breaks.

# Setup and debug
- build
  - `npm install`
  - `npm run build`
- develop
  - `npm run watch`
- test
  - `npm run test`
  - This builds **./testPage.html** that includes all the formatted HTML from the queries in **./test-cases**. The test page has a red line where the lineWidth resides (to quickly check if anything exceeds the line). 
  - **debugMode** is set to true for building the test page
- debug
  - in vscode in debug view select **Launch Debug**. This launches the file **./src/test/debug.ts** which contains a snippet to quickly debug powerquery code that causes issues. The resulting HTML will be copied to clipboard. I use [this jsfiddle](https://jsfiddle.net/v9foujth/) and paste the html code there. Then I can right click and inspect the code to view state and range properties.
  - **debugMode**: when debugMode is set to true in IHtmlSerializerConfig the spans of the resulting html will have some info properties attached to them:
    - **_id**: a unique id for the node. Use this to debug into the formatting functions of a specific node by setting a conditional breakpoint with `this._id == {relevant id}`.
    - **_kind**: The node kind
    - **_ext**: The node extension object
    - **_formatKind**: The BaseNode object kind
    - **_range**: The range after formatting ( *startLine:startUnit - endLine:endUnit* ). Note that the node range includes whitespace if the node respects whitespace.
    - **_formatCnt**: The number of times format was called on this node (for performance debugging)
    - **_isBroken**: Wether isBroken is true (and the node decided to break line)
    - **_wsBefore**: white space that should be inserted before the node. Is always 0 if the node does not respect whitespace
    - **_wsAfter**: white space that should be inserted after the node. Is always 0 if the node does not respect whitespace
  - You can also debug the test by selecting **Launch Test** in vscode.

# How it works
- the code gets parsed by the official [microsoft powerquery-parser](https://github.com/microsoft/powerquery-parser)
- the resulting Ast is then traversed and for the function **extendAll** (Factory.ts) which recursively extends all nodes with the required formatting functionality
- the resulting extended root node can then be formatted by calling **format** on it. This will recursively call format on all children propagating state objects that contain information about the current cursor position and about behavior overrides that stem from parent nodes. Each node kind can handle their formatting differently although much of the functionality can be reused. These are the levels where the formatting logic resides:
  - **INodeExtensionBase** (Base.ts): this contains all logic that is shared by all nodes
  - **IBaseNode** (Base.ts): this interface contains logic that should be shared by nodes with a common breaking strategy. Right now there are four strategies
    - **AlwaysBreaking** (AlwaysBreaking.ts): Always breaks line. 
    - **AlwaysInline** (AlwaysInline.ts): Never breaks line. Note that children can break line, so the node can contain newlines. But it never decided itself to add newlines.
    - **BreakOnLineEnd** (BreakOnLineEnd.ts): Breaks line if any child node exceeds the line length. 
      - Note that if a child node exceeds the line length this node will decide to break line even if it's parent has also strategy BreakOnLineEnd (the FormatResult.ExceedsLine does only travel to the **closest** BreakOnLineEnd node upwards).  
      - The strategy will first try to fit all nodes into a single line
      - If any node emits FormatResult.ExceedsLine this node will decide to break and reformat it's children.
    - **BreakOnAnyChild** (BreakOnAnyChild.ts): 
      - Contains the same logic as BreakOnLineEnd
      - Additionally breaks line when **FormatResult.Break** is received. 
      - Node that **FormatResult.Break** is emitted when any child node decides to break line. The **FormatResult.Break** travels upward to the **furthest** node that has strategy BreakOnAnyChild and **isBroken = false**. 
  - **IPrivateNodeExtension**
      - Contains all logic specific to formatting one or many NodeKinds that share the exact same children. This is where the breaking behavior is defined. 
      - **_formatInline()** contains logic for formatting the node in a single line. Note that a Node of kind AlwaysBreaking does not support _formatInline()
        - the _formatInline() function is a generator that yields FormatResults. That way whenever a result **FormatResult.Break** or **FormatResult.ExceedsLine** is encountered the formatting process can be aborted and the parent can continue with _formatBroken()
      - **_formatBroken()** contains logic for formatting the node when it decided to break line. Note that a Node of kind AlwaysInline does not support _formatBroken(). Also note that when all Nodes that support breaking are breaking line it's still possible for children to exceed line length. For example if a single string literal has greater length than the line width it's not possible to make it not exceed the line width with any breaking behavior.
      - **_children()** enumerates the children nodes. Note that it's ok to yield children that may be null. In initialize() the **children** property is filled with `Array.from(this._children()).filter(c => c != null)`
      - The big switch case that returns the appropriate IPrivateNodeExtension implementation resides in **Factory.ts**
  - after formatting all nodes contain a newly computed range. To update the tokenRange with the computed range values call *root.updateTokenRange()*. This will update the original token range that was emitted from the parser and also handles wsBefore and wsAfter correctly.
  - now the formatted node can be serialized using an **IAstSerializer**. There are two options
    - **HtmlAstSerializer**: emits HTML
    - **TextAstSerializer**: emits Text (currently not very well tested)
- For examples look at **./test**

# TODO
This formatter is not totally finished. It's actually a rewrite of the first version that I built and that is currently accessible at [powerqueryformatter.com](https://www.powerqueryformatter.com). There are still some issues with this newer, much faster and more structured version. For example comments are still causing some problems and some test cases don't pass. Also the configuration parameters are not implemented at the moment! I will get back to fixing that once I return from holidays. Also have a look at the open issues.