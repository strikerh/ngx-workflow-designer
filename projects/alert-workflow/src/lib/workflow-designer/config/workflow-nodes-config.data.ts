import {
  NodeTypeConfig,
  GenericSelectorOptions,
  DynamicSelectOptions,
  PaletteCategoryConfig,
} from '../workflow-designer.interfaces';

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
      { key: 'label', label: 'Trigger Name', type: 'text', required: true, placeholder: 'Emergency Alert', default: 'Manual Trigger' }
    ],
    exits: ['next']
  },
  {
    type: 'control.if',
    category: 'control',
    label: 'If / Else',
    description: 'Conditional branching based on expression',
    icon: "<span class='material-icons'>call_split</span>",
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    nodeColor: 'bg-sky-50 border-sky-200',
    properties: [
      { key: 'condition', label: 'Condition', type: 'text', required: true, placeholder: 'a > b', helpText: 'JavaScript expression that evaluates to true/false' }
    ],
    exits: ['onTrue', 'onFalse']
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
      { key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Alert message' }
    ],
    exits: ['onSuccess', 'onFailure']
  },
  {
    type: 'end.terminate',
    category: 'terminal',
    label: 'End',
    description: 'Terminate workflow',
    icon: "<span class='material-icons'>stop</span>",
    color: 'bg-slate-100 border-slate-300 text-slate-800',
    nodeColor: 'bg-slate-50 border-slate-200',
    properties: [],
    exits: []
  }
];
