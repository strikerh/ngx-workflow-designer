import { NodeTypeConfig, PaletteCategoryConfig } from "ngx-workflow-designer";


export const PALETTE_CATEGORIES: PaletteCategoryConfig[] = [
  { id: 'triggers', label: 'Triggers', icon: '⚡', headerClass: 'text-amber-700', filterPrefix: 'trigger.' },
  { id: 'controls', label: 'Controls', icon: '🧭', headerClass: 'text-sky-700', filterPrefix: 'control.' },
  { id: 'actions', label: 'Actions', icon: '🎯', headerClass: 'text-emerald-700', filterPrefix: 'action.' },
  { id: 'terminals', label: 'Terminals', icon: '⛔', headerClass: 'text-slate-700', filterPrefix: 'end.' },
  { id: 'utility', label: 'Utility', icon: '🔧', headerClass: 'text-purple-700', filterPrefix: ['var.', 'audit.', 'utility.'] },
];

// Minimal starter set. Full set remains in the app copy until we swap imports.
export const WORKFLOW_NODES_CONFIG: NodeTypeConfig[] = [
  {
    type: 'trigger.manual',
    category: 'trigger',
    label: 'Manual Trigger',
    description: 'Start workflow manually by user action',
    icon: "<span class='material-icons'>play_arrow</span>",
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    nodeColor: 'bg-amber-50 border-amber-200',
    properties: [
      { key: 'label', label: 'Trigger Name', type: 'text', required: true, placeholder: 'Emergency Alert', default: 'Manual Trigger', showInNode: true }
    ],
    exits: ['next']
  },
  // 1) Start
  {
    type: 'trigger.start',
    category: 'trigger',
    label: 'Start',
    description: 'Entry point of the call flow',
    icon: "<span class='material-icons'>play_circle</span>",
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    nodeColor: 'bg-amber-50 border-amber-200',
    properties: [],
    exits: ['OnStart']
  },
  // 2) End
  {
    type: 'end.terminate',
    category: 'terminal',
    label: 'End',
    description: 'Logical end of the flow (no hangup)',
    icon: "<span class='material-icons'>stop_circle</span>",
    color: 'bg-slate-100 border-slate-300 text-slate-800',
    nodeColor: 'bg-slate-50 border-slate-200',
    properties: [
      { key: 'disposition', label: 'Disposition', type: 'text', required: false, placeholder: 'Completed' },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Optional notes' }
    ],
    exits: []
  },
  // 3) Hangup
  {
    type: 'end.hangup',
    category: 'terminal',
    label: 'Hangup',
    description: 'Immediately hang up the call',
    icon: "<span class='material-icons'>call_end</span>",
    color: 'bg-rose-100 border-rose-300 text-rose-800',
    nodeColor: 'bg-rose-50 border-rose-200',
    properties: [
      { key: 'reason', label: 'Reason', type: 'text', required: false, placeholder: 'User request / Business rule' },
      { key: 'logLevel', label: 'Log Level', type: 'select', options: ['Verbose','Info','Warning','Error'] }
    ],
    exits: []
  },
  // 4) Play (Audio/TTS)
  {
    type: 'action.play',
    category: 'action',
    label: 'Play Prompt',
    description: 'Play Audio/TTS with optional barge-in',
    icon: "<span class='material-icons'>volume_up</span>",
    color: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    nodeColor: 'bg-indigo-50 border-indigo-200',
    properties: [
      { key: 'bargeIn', label: 'Barge-In', type: 'select', options: ['true','false'], showInNode: true },
      { key: 'prompt', label: 'PromptSpec (JSON array)', type: 'textarea', required: true, placeholder: '[{"locale":"en-US","tts":"Welcome"}]', helpText: 'Array of {locale, tts|audio, ssml?, speed?, volume?}' },
      { key: 'gainDb', label: 'Gain (dB)', type: 'number', required: false },
      { key: 'repeat', label: 'Repeat count', type: 'number', required: false },
      { key: 'allowSkipKeys', label: 'Allow Skip Keys', type: 'text', required: false, placeholder: '#,*' }
    ],
    exits: ['OnCompleted','OnBargeIn','OnError']
  },
  // 5) GatherDigits
  {
    type: 'action.gatherDigits',
    category: 'action',
    label: 'Gather Digits',
    description: 'Collect DTMF input with retries and prompts',
    icon: "<span class='material-icons'>dialpad</span>",
    color: 'bg-teal-100 border-teal-300 text-teal-800',
    nodeColor: 'bg-teal-50 border-teal-200',
    properties: [
      { key: 'min', label: 'Min digits', type: 'number', required: true },
      { key: 'max', label: 'Max digits', type: 'number', required: true },
      { key: 'terminator', label: 'Terminator', type: 'text', required: false, placeholder: '#' },
      { key: 'timeoutMs', label: 'Timeout (ms)', type: 'number', required: true },
      { key: 'interDigitTimeoutMs', label: 'Inter-digit Timeout (ms)', type: 'number', required: false },
      { key: 'attempts', label: 'Max Attempts', type: 'number', required: true },
      { key: 'pattern', label: 'Pattern (regex)', type: 'text', required: false, placeholder: '^[0-9]{4}$', showInNode: true },
      { key: 'noInputPrompt', label: 'No Input Prompt (JSON)', type: 'textarea', required: false },
      { key: 'noMatchPrompt', label: 'No Match Prompt (JSON)', type: 'textarea', required: false }
    ],
    exits: ['OnMatch','OnNoInput','OnNoMatch','OnMaxAttempts','OnError']
  },
  // 6) Menu / Confirm
  {
    type: 'action.menu',
    category: 'action',
    label: 'Menu / Confirm',
    description: 'DTMF menu with retries and prompts',
    icon: "<span class='material-icons'>menu</span>",
    color: 'bg-cyan-100 border-cyan-300 text-cyan-800',
    nodeColor: 'bg-cyan-50 border-cyan-200',
    properties: [
      { key: 'choices', label: 'Choices map (JSON)', type: 'textarea', required: true, placeholder: '{"1":"sales","2":"support"}' },
      { key: 'invalidRetries', label: 'Invalid Retries', type: 'number', showInNode: true },
      { key: 'timeoutMs', label: 'Timeout (ms)', type: 'number' },
      { key: 'prompt', label: 'Prompt (JSON)', type: 'textarea' },
      { key: 'invalidPrompt', label: 'Invalid Prompt (JSON)', type: 'textarea' },
      { key: 'timeoutPrompt', label: 'Timeout Prompt (JSON)', type: 'textarea' }
    ],
    exits: ['On1','On2','On3','On4','On5','On6','On7','On8','On9','OnTimeout','OnInvalid','OnMaxRetries','OnError']
  },
  // 7) Branch / If
  {
    type: 'control.if',
    category: 'control',
    label: 'If / Else',
    description: 'Conditional branching based on expression',
    icon: "<span class='material-icons'>call_split</span>",
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    nodeColor: 'bg-sky-50 border-sky-200',
    properties: [
      { key: 'expression', label: 'Expression', type: 'text', required: true, placeholder: 'Variables.lang == "en"', showInNode: true }
    ],
    exits: ['OnTrue','OnFalse','OnError']
  },
  // 8) SetVariable / Evaluate
  {
    type: 'action.setVariable',
    category: 'utility',
    label: 'Set Variable / Evaluate',
    description: 'Assign values or run simple scripts',
    icon: "<span class='material-icons'>assignment</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      { key: 'assign', label: 'Assignments (JSON array)', type: 'textarea', helpText: '[{"path":"Variables.orderId","value":123,"scope":"call"}]', showInNode: true },
      { key: 'script', label: 'Script', type: 'textarea', placeholder: 'result = a + b' }
    ],
    exits: ['OnNext','OnError']
  },
  // 9) TransferCall
  {
    type: 'action.transfer',
    category: 'action',
    label: 'Transfer Calla',
    description: 'Transfer to queue, agent, or external number',
    icon: "<span class='material-icons'>call_transfer</span>",
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    nodeColor: 'bg-yellow-50 border-yellow-200',
    properties: [
      { key: 'type', label: 'Type', type: 'select', options: ['queue','agent','external'] },
      { key: 'target', label: 'Target', type: 'text', required: true, placeholder: 'queue-name / agent-id / +123...', showInNode: true },
      { key: 'ringback', label: 'Ringback (Prompt JSON or tone)', type: 'textarea' },
      { key: 'connectTimeoutMs', label: 'Connect Timeout (ms)', type: 'number' },
      { key: 'record', label: 'Record', type: 'select', options: ['true','false'] },
      { key: 'whisper', label: 'Whisper Prompt (JSON)', type: 'textarea' },
      { key: 'amd', label: 'AMD (Answering Machine Detection)', type: 'select', options: ['true','false'] },
      { key: 'failover', label: 'Failover list (JSON array)', type: 'textarea' }
    ],
    exits: ['OnConnected','OnBusy','OnNoAnswer','OnTimeout','OnFailed','OnCallerHangup','OnAgentHangup','OnError']
  },
  // 10) DatabaseQuery
  {
    type: 'action.dbQuery',
    category: 'action',
    label: 'Database Query',
    description: 'Execute DB query or stored procedure',
    icon: "<span class='material-icons'>storage</span>",
    color: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
    nodeColor: 'bg-fuchsia-50 border-fuchsia-200',
    properties: [
      { key: 'provider', label: 'Provider', type: 'select', options: ['SqlServer','MySql','Postgres'] },
      { key: 'connectionRef', label: 'Connection Ref', type: 'text', required: true },
      { key: 'command', label: 'Command', type: 'select', options: ['text','storedProc'] },
      { key: 'textOrName', label: 'Text / Proc Name', type: 'text', required: true, showInNode: true },
      { key: 'params', label: 'Params (JSON array)', type: 'textarea', helpText: '[{"name":"id","valueFromVar":"Variables.customerId"}]' },
      { key: 'expect', label: 'Expect', type: 'select', options: ['scalar','singleRow','multiRow'] },
      { key: 'mapTo', label: 'Map to (path)', type: 'text', placeholder: 'Variables.customer' }
    ],
    exits: ['OnSuccess','OnNoRows','OnError']
  },
  // 11) HttpRequest
  {
    type: 'action.http',
    category: 'action',
    label: 'HTTP Request',
    description: 'Call external HTTP endpoint',
    icon: "<span class='material-icons'>http</span>",
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    nodeColor: 'bg-blue-50 border-blue-200',
    properties: [
      { key: 'method', label: 'Method', type: 'select', options: ['GET','POST','PUT','PATCH','DELETE'] },
      { key: 'url', label: 'URL', type: 'text', required: true, showInNode: true },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea' },
      { key: 'authRef', label: 'Auth Ref', type: 'text' },
      { key: 'body', label: 'Body (JSON)', type: 'textarea' },
      { key: 'retry', label: 'Retry (JSON)', type: 'textarea', helpText: '{"max":3,"backoffMs":500,"on":"5xx|timeout"}' },
      { key: 'timeoutMs', label: 'Timeout (ms)', type: 'number' }
    ],
    exits: ['On2xx','On4xx','On5xx','OnTimeout','OnError']
  },
  // 12) Loop / Retry / Wait
  {
    type: 'control.loop',
    category: 'control',
    label: 'Loop / Retry / Wait',
    description: 'Iterate with delay/backoff or until condition',
    icon: "<span class='material-icons'>repeat</span>",
    color: 'bg-violet-100 border-violet-300 text-violet-800',
    nodeColor: 'bg-violet-50 border-violet-200',
    properties: [
      { key: 'count', label: 'Count', type: 'number' },
      { key: 'delayMs', label: 'Delay (ms)', type: 'number' },
      { key: 'backoff', label: 'Backoff', type: 'select', options: ['linear','expo'] },
      { key: 'untilExpr', label: 'Until Expression', type: 'text', placeholder: 'Variables.ready == true', showInNode: true }
    ],
    exits: ['OnNext','OnCompleted','OnMaxRetries','OnError']
  },
  // 13) RecordMessage
  {
    type: 'action.record',
    category: 'action',
    label: 'Record Message',
    description: 'Record audio with optional transcription',
    icon: "<span class='material-icons'>mic</span>",
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    nodeColor: 'bg-orange-50 border-orange-200',
    properties: [
      { key: 'maxDurationSec', label: 'Max Duration (sec)', type: 'number' },
      { key: 'silenceTimeoutMs', label: 'Silence Timeout (ms)', type: 'number', showInNode: true },
      { key: 'beep', label: 'Beep', type: 'select', options: ['true','false'] },
      { key: 'format', label: 'Format', type: 'select', options: ['wav','ulaw','alaw'] },
      { key: 'pathRef', label: 'Path Ref', type: 'text' },
      { key: 'transcribeEnabled', label: 'Transcribe', type: 'select', options: ['true','false'] },
      { key: 'transcribeProviderRef', label: 'Transcribe Provider', type: 'text' },
      { key: 'locale', label: 'Locale', type: 'text', placeholder: 'en-US' }
    ],
    exits: ['OnRecorded','OnSilence','OnMaxDuration','OnError']
  },
  // 14) CheckQuota / RateLimit
  {
    type: 'action.quota',
    category: 'action',
    label: 'Check Quota / Rate Limit',
    description: 'Rate limit by policy and key',
    icon: "<span class='material-icons'>speed</span>",
    color: 'bg-lime-100 border-lime-300 text-lime-800',
    nodeColor: 'bg-lime-50 border-lime-200',
    properties: [
      { key: 'policyId', label: 'Policy ID', type: 'text', required: true, showInNode: true },
      { key: 'key', label: 'Key', type: 'text', required: true },
      { key: 'window', label: 'Window', type: 'select', options: ['day','week','month','custom'] },
      { key: 'limit', label: 'Limit', type: 'number' }
    ],
    exits: ['Allowed','Denied','OnError']
  },
  // 15) Try/Catch / ErrorHandler
  {
    type: 'control.tryCatch',
    category: 'control',
    label: 'Try / Catch',
    description: 'Handle errors with catch/finally paths',
    icon: "<span class='material-icons'>handyman</span>",
    color: 'bg-zinc-100 border-zinc-300 text-zinc-800',
    nodeColor: 'bg-zinc-50 border-zinc-200',
    properties: [
      { key: 'tryTargets', label: 'Try Targets (info)', type: 'textarea', helpText: 'Designer-managed. Use edges to define next nodes.' },
      { key: 'catchOn', label: 'Catch On', type: 'text', placeholder: 'HttpError,DbError,Any', showInNode: true },
      { key: 'finallyTarget', label: 'Finally Target (info)', type: 'textarea', helpText: 'Designer-managed. Use edges.' }
    ],
    exits: ['OnTryNext','OnCatch','OnFinally']
  },
  // 16) Log / Telemetry
  {
    type: 'utility.log',
    category: 'utility',
    label: 'Log / Telemetry',
    description: 'Emit telemetry message with properties',
    icon: "<span class='material-icons'>article</span>",
    color: 'bg-slate-100 border-slate-300 text-slate-800',
    nodeColor: 'bg-slate-50 border-slate-200',
    properties: [
      { key: 'message', label: 'Message', type: 'textarea', required: true, showInNode: true },
      { key: 'properties', label: 'Properties (JSON)', type: 'textarea' },
      { key: 'level', label: 'Level', type: 'select', options: ['Verbose','Info','Warning','Error'] }
    ],
    exits: ['OnNext','OnError']
  },
  // 17) Subflow / Goto
  {
    type: 'action.subflow',
    category: 'action',
    label: 'Subflow / Goto',
    description: 'Invoke another flow and return or fire-and-forget',
    icon: "<span class='material-icons'>maps_ugc</span>",
    color: 'bg-rose-100 border-rose-300 text-rose-800',
    nodeColor: 'bg-rose-50 border-rose-200',
    properties: [
      { key: 'subflowId', label: 'Subflow ID', type: 'text', required: true, showInNode: true },
      { key: 'version', label: 'Version', type: 'text', placeholder: 'Published | v1' },
      { key: 'inBindings', label: 'In Bindings (JSON array)', type: 'textarea' },
      { key: 'outBindings', label: 'Out Bindings (JSON array)', type: 'textarea' },
      { key: 'mode', label: 'Mode', type: 'select', options: ['call','fire-and-forget'] }
    ],
    exits: ['OnReturn','OnError']
  },
  // 18) RecognizeSpeech (ASR)
  {
    type: 'action.recognizeSpeech',
    category: 'action',
    label: 'Recognize Speech',
    description: 'Speech recognition with hints and timeouts',
    icon: "<span class='material-icons'>hearing</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      { key: 'locale', label: 'Locale', type: 'text', placeholder: 'en-US', showInNode: true },
      { key: 'hints', label: 'Hints (JSON array)', type: 'textarea', placeholder: '["yes","no"]' },
      { key: 'noInputTimeoutMs', label: 'No Input Timeout (ms)', type: 'number' },
      { key: 'maxAlt', label: 'Max Alternatives', type: 'number' }
    ],
    exits: ['OnRecognized','OnNoInput','OnLowConfidence','OnError']
  },
  // 19) CacheGet
  {
    type: 'action.cacheGet',
    category: 'action',
    label: 'Cache Get',
    description: 'Fetch value from cache',
    icon: "<span class='material-icons'>cached</span>",
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    nodeColor: 'bg-amber-50 border-amber-200',
    properties: [
      { key: 'key', label: 'Key', type: 'text', required: true, showInNode: true },
      { key: 'scope', label: 'Scope', type: 'select', options: ['call','flow','global'] }
    ],
    exits: ['OnHit','OnMiss','OnError']
  },
  // 19b) CacheSet
  {
    type: 'action.cacheSet',
    category: 'action',
    label: 'Cache Set',
    description: 'Store value in cache with TTL',
    icon: "<span class='material-icons'>save</span>",
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    nodeColor: 'bg-amber-50 border-amber-200',
    properties: [
      { key: 'key', label: 'Key', type: 'text', required: true, showInNode: true },
      { key: 'scope', label: 'Scope', type: 'select', options: ['call','flow','global'] },
      { key: 'ttlMs', label: 'TTL (ms)', type: 'number' },
      { key: 'valueFromVar', label: 'Value From Var', type: 'text', placeholder: 'Variables.result' }
    ],
    exits: ['OnNext','OnError']
  },
  // 20) Throttle (Anti-Flood)
  {
    type: 'action.throttle',
    category: 'action',
    label: 'Throttle',
    description: 'Anti-flood rate limiting per key/window',
    icon: "<span class='material-icons'>timer</span>",
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    nodeColor: 'bg-sky-50 border-sky-200',
    properties: [
      { key: 'key', label: 'Key', type: 'text', required: true, showInNode: true },
      { key: 'windowMs', label: 'Window (ms)', type: 'number', required: true },
      { key: 'maxCalls', label: 'Max Calls', type: 'number', required: true }
    ],
    exits: ['Allowed','Throttled','OnError']
  },
  // 21) Validator
  {
    type: 'utility.validator',
    category: 'utility',
    label: 'Validator',
    description: 'Validate values by rules (E.164, Luhn, regex)',
    icon: "<span class='material-icons'>rule</span>",
    color: 'bg-green-100 border-green-300 text-green-800',
    nodeColor: 'bg-green-50 border-green-200',
    properties: [
      { key: 'rules', label: 'Rules (JSON array)', type: 'textarea', placeholder: '["E164","regex:^\\\d{4}$"]', showInNode: true }
    ],
    exits: ['OnValid','OnInvalid']
  },
  
  {
    type: 'action.sms',
    category: 'action',
    label: 'SMS',
    description: 'Send SMS message to recipients',
    icon: "<span class='material-icons'>sms</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      { key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Alert message', showInNode: true }
    ],
    exits: ['onSuccess', 'onFailure']
  },
  // Keep older minimal "End" alias for compatibility
  {
    type: 'end.simple',
    category: 'terminal',
    label: 'End (Simple)',
    description: 'Terminate workflow',
    icon: "<span class='material-icons'>stop</span>",
    color: 'bg-slate-100 border-slate-300 text-slate-800',
    nodeColor: 'bg-slate-50 border-slate-200',
    properties: [],
    exits: []
  }
];
