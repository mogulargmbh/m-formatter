const alignmentStrategySchema = { 
  type: "string", 
  enum: ["never", "always", "singleline"]
};

export var IFormatterConfigSchema = {
  $schema: "http://json-schema.org/schema#",
  type: "object",
  properties: {
    lineWidth: { type: "number", min: 50},
    indentationLength: { type: "number", min: 0},
    includeComments: {type: "boolean"},
    newlineCsvInLeft: {type: "boolean"},
    alignLineCommentsToPosition: {type: "number"},
    alignPairedLetExpressionsByEqual: alignmentStrategySchema,
    alignPairedRecordExpressionsByEqual: alignmentStrategySchema
  },
  additionalProperties: false,
  required: []
};

export var ITextAstSerializerConfigSchema = {
  $schema: "http://json-schema.org/schema#",
  type: "object",
  properties: {
    debugMode: {type: "boolean"},
    ws: { type: "string" },
    indentation: { type: "string"},
    lineEnd: { type: "string" },
  },
  additionalProperties: false,
  required: []
};

export var IHtmlAstSerializerConfigSchema = {
  $schema: "http://json-schema.org/schema#",
  type: "object",
  properties: {
    debugMode: {type: "boolean"},
    ws: { type: "string" },
    indentation: { type: "string"},
    lineEnd: { type: "string" },
    numBrackets: { type: "number", min: 1},
    inlineCss: { type: "string" },
    inlineCssToggle: {type: "boolean"},
  },
  additionalProperties: false,
  required: []
};