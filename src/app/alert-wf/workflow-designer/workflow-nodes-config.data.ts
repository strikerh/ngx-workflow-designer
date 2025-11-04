import {
  NodeTypeConfig,
  GenericSelectorOptions,
  DynamicSelectOptions,
  PaletteCategoryConfig,
} from './workflow-designer.interfaces';

/**
 * Workflow Node Types Configuration
 *
 * This is a TypeScript version of workflow-nodes-config.json for development purposes.
 * Provides full type safety and IDE autocomplete.
 *
 * To use this instead of the JSON file, set USE_TYPESCRIPT_CONFIG = true in workflow-nodes-config.service.ts
 */

/**
 * Palette Categories Configuration
 * Defines how nodes are organized in the palette sidebar
 */
export const PALETTE_CATEGORIES: PaletteCategoryConfig[] = [
  {
    id: 'triggers',
    label: 'Triggers',
    icon: '⚡',
    headerClass: 'text-amber-700',
    filterPrefix: 'trigger.',
  },
  {
    id: 'controls',
    label: 'Controls',
    icon: '🧭',
    headerClass: 'text-sky-700',
    filterPrefix: 'control.',
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: '🎯',
    headerClass: 'text-emerald-700',
    filterPrefix: 'action.',
  },
  {
    id: 'terminals',
    label: 'Terminals',
    icon: '⛔',
    headerClass: 'text-slate-700',
    filterPrefix: 'end.',
  },
  {
    id: 'utility',
    label: 'Utility',
    icon: '🔧',
    headerClass: 'text-purple-700',
    filterPrefix: ['var.', 'audit.', 'utility.'],
  },
];

export const WORKFLOW_NODES_CONFIG: NodeTypeConfig[] = [
  // ============ TRIGGERS ============
  {
    type: 'trigger.manual',
    category: 'trigger',
    label: 'Manual Trigger',
    description: 'Start workflow manually by user action',
    icon: "<span class='material-icons'>play_arrow</span>",
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    nodeColor: 'bg-amber-50 border-amber-200',
    properties: [
      {
        key: 'label',
        label: 'Trigger Name',
        type: 'text',
        required: true,
        placeholder: 'Emergency Alert',
        default: 'Manual Trigger',
      },
    ],
    exits: ['next'],
  },
  {
    type: 'trigger.webhook',
    category: 'trigger',
    label: 'API/Webhook',
    description: 'Start workflow from API call or webhook',
    icon: "<span class='material-icons'>webhook</span>",
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    nodeColor: 'bg-amber-50 border-amber-200',
    properties: [
      {
        key: 'endpoint',
        label: 'Endpoint Path',
        type: 'text',
        required: true,
        readonly: true,
        placeholder: '/api/workflow/auto-generated',
        helpText: 'Auto-generated unique webhook endpoint (readonly)',
        default: '{{AUTO_GENERATE_UUID}}',
      },
      {
        key: 'method',
        label: 'HTTP Method',
        type: 'select',
        required: true,
        options: {
          options: ['POST', 'GET', 'PUT', 'PATCH'],
        } as DynamicSelectOptions,
        default: 'POST',
      },
    ],
    exits: ['next'],
  },
  {
    type: 'trigger.schedule',
    category: 'trigger',
    label: 'Schedule/Cron',
    description: 'Start workflow on a schedule',
    icon: "<span class='material-icons'>schedule</span>",
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    nodeColor: 'bg-amber-50 border-amber-200',
    properties: [
      {
        key: 'cronExpression',
        label: 'Cron Expression',
        type: 'text',
        required: true,
        placeholder: '0 0 8 * * *',
        helpText: `Cron Expression Format: second minute hour day month dayOfWeek

📋 Format: [second] [minute] [hour] [day] [month] [dayOfWeek]
• second: 0-59
• minute: 0-59
• hour: 0-23
• day: 1-31
• month: 1-12 (or JAN-DEC)
• dayOfWeek: 0-6 (0=Sunday, or SUN-SAT)

Special Characters:
• * = any value
• , = list separator (e.g., 1,3,5)
• - = range (e.g., 1-5)
• / = step values (e.g., */5 = every 5)

📌 Common Examples:
• 0 0 8 * * * = Every day at 8:00 AM
• 0 30 14 * * * = Every day at 2:30 PM
• 0 0 0 * * * = Every day at midnight
• 0 0 9 * * MON-FRI = Weekdays at 9:00 AM
• 0 0 12 1 * * = First day of every month at noon
• 0 */15 * * * * = Every 15 minutes
• 0 0 */2 * * * = Every 2 hours
• 0 0 0 * * SUN = Every Sunday at midnight
• 0 0 6,18 * * * = Every day at 6:00 AM and 6:00 PM
• 0 0 8-17 * * MON-FRI = Weekdays, hourly from 8 AM to 5 PM`,
      },
    ],
    exits: ['next'],
  },
  

  // ============ CONTROLS ============
  {
    type: 'control.if',
    category: 'control',
    label: 'If / Else',
    description: 'Conditional branching based on expression',
    icon: "<span class='material-icons'>call_split</span>",
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    nodeColor: 'bg-sky-50 border-sky-200',
    properties: [
      {
        key: 'condition',
        label: 'Condition',
        type: 'text',
        required: true,
        placeholder: 'a > b',
        helpText: 'JavaScript expression that evaluates to true/false',
      },
    ],
    exits: ['onTrue', 'onFalse'],
  },
  {
    type: 'control.switch',
    category: 'control',
    label: 'Switch',
    description: 'Multi-way branching based on value',
    icon: "<span class='material-icons'>alt_route</span>",
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    nodeColor: 'bg-sky-50 border-sky-200',
    properties: [
      {
        key: 'expression',
        label: 'Switch Expression',
        type: 'text',
        required: true,
        placeholder: 'severity',
        helpText: "Expression to evaluate (e.g., 'alert.severity')",
      },
      {
        key: 'cases',
        label: 'Case Values',
        type: 'switch-cases',
        required: true,
        placeholder: 'CRITICAL,HIGH,MEDIUM,LOW',
        helpText: 'Add case values dynamically. Each case becomes an output connection point.',
      },
    ],
    exits: [],
  },
  {
    type: 'control.approval',
    category: 'control',
    label: 'Approval',
    description: 'Wait for human approval before continuing',
    icon: "<span class='material-icons'>approval</span>",
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    nodeColor: 'bg-purple-50 border-purple-200',
    properties: [
      {
        key: 'role',
        label: 'Role',
        type: 'text',
        required: true,
        placeholder: 'ChargeNurse',
        helpText: 'Role or user group that can approve',
      },
      {
        key: 'slaMinutes',
        label: 'SLA (minutes)',
        type: 'number',
        required: false,
        placeholder: '2',
        helpText: 'Time limit for approval in minutes',
      },
      {
        key: 'timeoutSeconds',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        placeholder: '60',
        default: 60,
        helpText:
          'Maximum time to wait for approval before triggering timeout exit (in seconds)',
      },
    ],
    exits: ['onApproved', 'onRejected', 'onTimeout'],
  },
  {
    type: 'control.wait',
    category: 'control',
    label: 'Wait / Timer',
    description: 'Pause workflow for specified duration',
    icon: "<span class='material-icons'>timer</span>",
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    nodeColor: 'bg-purple-50 border-purple-200',
    properties: [
      {
        key: 'seconds',
        label: 'Seconds',
        type: 'number',
        required: true,
        placeholder: '60',
        helpText: 'How long to wait before continuing',
      },
    ],
    exits: ['next'],
  },

  // ============ ACTIONS ============
  {
    type: 'action.sms',
    category: 'action',
    label: 'SMS',
    description: 'Send SMS message to recipients',
    icon: "<span class='material-icons'>sms</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      {
        key: 'smsTemplateId',
        label: 'SMS Template',
        type: 'select',
        required: true,
        helpText: 'Choose an SMS template or create a custom message',
        // icon: "📱",
        options: {
          endpoint:
            'http://192.168.37.7:5001/api/AlertChannelTemplate/by-provider/1',
          valueField: 'id',
          displayField: 'templateName',
          secondaryDisplayField: 'templateString',
          showSearch: true,
          responseDataPath: 'results',
          // Add "Custom Message" option at the end of the list
          appendOptions: [
            {
              value: 0,
              label: 'Custom Message',
              secondaryLabel: 'Write your own SMS message',
              separator: true, // Shows separator line before this option
            },
          ],
          // Auto-set other fields when specific template is selected
          autoSetFields: [
            {
              triggerValue: 0, // When "Custom Message" is selected
              fieldUpdates: {
                customMessage: '', // Pre-fill the custom message field
              },
            },
            // Add more rules as needed:
            // {
            //   triggerValue: 123,  // When template ID 123 is selected
            //   fieldUpdates: {
            //     priority: "high",
            //     retryAttempts: 3
            //   }
            // }
          ],
        } as DynamicSelectOptions,
      },
      {
        key: 'customMessage',
        label: 'Custom Message',
        type: 'textarea',
        required: false,
        placeholder: 'Enter your custom SMS message...',
        helpText: 'SMS content (max 160 characters recommended)',
        // icon: "✍️",
        // This field is only shown when smsTemplateId equals 0 (Custom Message)
        showIf: {
          watchField: 'smsTemplateId',
          operator: 'equals',
          value: 0,
        },
      },
      {
        key: 'smsProvider',
        label: 'SMS Provider',
        type: 'select',
        required: true,
        options: {
          endpoint: 'http://192.168.37.7:5001/api/SmsProvider/all',
          valueField: 'smsProviderId',
          displayField: 'displayName',
          // secondaryDisplayField: "apiUrl",
          showSearch: false,
          responseDataPath: 'results',
        } as DynamicSelectOptions,
      },
      {
        key: 'timeoutSeconds',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        placeholder: '60',
        default: 60,
        helpText:
          'Maximum time to wait for SMS delivery before triggering timeout exit (in seconds)',
      },
      {
        key: 'notificationGroups',
        label: 'User Groups',
        type: 'generic-selector',
        required: false,
        placeholder: 'Select groups',
        helpText: 'Select user groups to send SMS notifications',
        icon: "<span class='material-icons'>groups</span>",
        options: {
          endpoint: 'http://192.168.37.7:5001/api/NotificationUsers',
          valueField: 'notificationID',
          primaryDisplayField: 'name',
          secondaryDisplayField: 'description',
          searchLabel: 'Search User Groups',
          searchPlaceholder: 'Type to search groups...',
          selectedLabel: 'Selected Groups',
          emptyStateMessage: 'No groups selected yet',
          responseDataPath: 'results',
        } as GenericSelectorOptions,
      },
      {
        key: 'users',
        label: 'Users',
        type: 'generic-selector',
        required: false,
        placeholder: 'Select users',
        helpText: 'Select individual users to send SMS notifications',
        icon: "<span class='material-icons'>person</span>",
        options: {
          endpoint: 'http://192.168.37.7:5001/api/Users/all',
          valueField: 'userId',
          primaryDisplayField: 'fullName',
          secondaryDisplayField: 'email',
          searchLabel: 'Search Users',
          searchPlaceholder: 'Type to search users...',
          selectedLabel: 'Selected Users',
          emptyStateMessage: 'No users selected yet',
          responseDataPath: 'results',
        } as GenericSelectorOptions,
      },
    ],
    exits: ['onSuccess', 'onTimeout', 'onFailure'],
  },
  {
    type: 'action.push',
    category: 'action',
    label: 'Mobile Push',
    description: 'Send push notification to mobile devices',
    icon: "<span class='material-icons'>notifications</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      {
        key: 'smsTemplateId',
        label: 'SMS Template',
        type: 'select',
        required: true,
        placeholder: 'Select SMS template',
        helpText: 'Choose an SMS template or create a custom message',
        default: 0,
        // icon: "📱",
        options: {
          valueField: 'id',
          displayField: 'templateName',
          secondaryDisplayField: 'templateString',
          showSearch: false,
          responseDataPath: 'results',
          options: [
            // Static options can be defined here if needed
            {
              value: 0,
              label: 'default',
              secondaryLabel: 'The default mobile push template',
              separator: true, // Shows separator line before this option
            },
            {
              value: 1,
              label: 'Custom Message',
              secondaryLabel: 'Write your own SMS message',
              separator: true, // Shows separator line before this option
            },
          ],

          // Auto-set other fields when specific template is selected
          autoSetFields: [
            {
              triggerValue: 1, // When "Custom Message" is selected
              fieldUpdates: {
                customMessage: '', // Pre-fill the custom message field
              },
            },
            // Add more rules as needed:
            // {
            //   triggerValue: 123,  // When template ID 123 is selected
            //   fieldUpdates: {
            //     priority: "high",
            //     retryAttempts: 3
            //   }
            // }
          ],
        } as DynamicSelectOptions,
      },
      {
        key: 'customMessage',
        label: 'Custom Message',
        type: 'textarea',
        required: false,

        placeholder: 'Enter your custom SMS message...',
        helpText: 'SMS content (max 160 characters recommended)',
        // icon: "✍️",
        // This field is only shown when smsTemplateId equals 0 (Custom Message)
        showIf: {
          watchField: 'smsTemplateId',
          operator: 'equals',
          value: 1,
        },
      },

  
      {
        key: 'timeoutSeconds',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        placeholder: '60',
        default: 60,
        helpText:
          'Maximum time to wait for push notification delivery before triggering timeout exit (in seconds)',
      },

          {
        key: 'notificationGroups',
        label: 'User Groups',
        type: 'generic-selector',
        required: false,
        placeholder: 'Select groups',
        helpText: 'Select user groups to send SMS notifications',
        icon: "<span class='material-icons'>groups</span>",
        options: {
          endpoint: 'http://192.168.37.7:5001/api/NotificationUsers',
          valueField: 'notificationID',
          primaryDisplayField: 'name',
          secondaryDisplayField: 'description',
          searchLabel: 'Search User Groups',
          searchPlaceholder: 'Type to search groups...',
          selectedLabel: 'Selected Groups',
          emptyStateMessage: 'No groups selected yet',
          responseDataPath: 'results',
        } as GenericSelectorOptions,
      },
      {
        key: 'users',
        label: 'Users',
        type: 'generic-selector',
        required: false,
        placeholder: 'Select users',
        helpText: 'Select individual users to send SMS notifications',
        icon: "<span class='material-icons'>person</span>",
        options: {
          endpoint: 'http://192.168.37.7:5001/api/Users/all',
          valueField: 'userId',
          primaryDisplayField: 'fullName',
          secondaryDisplayField: 'email',
          searchLabel: 'Search Users',
          searchPlaceholder: 'Type to search users...',
          selectedLabel: 'Selected Users',
          emptyStateMessage: 'No users selected yet',
          responseDataPath: 'results',
        } as GenericSelectorOptions,
      },
    ],
    exits: ['onSuccess', 'onTimeout', 'onFailure'],
  },
  {
    type: 'action.email',
    category: 'action',
    label: 'Email',
    description: 'Send email to recipients',
    icon: "<span class='material-icons'>email</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      {
        key: 'emailTemplateId',
        label: 'Email Template',
        type: 'select',
        required: true,
        placeholder: 'Select email template',
        helpText: 'Choose an email template or create a custom message',
        options: {
          endpoint:
            'http://192.168.37.7:5001/api/AlertChannelTemplate/by-provider/7',
          valueField: 'id',
          displayField: 'templateName',
          secondaryDisplayField: 'templateString',
          showSearch: true,
          responseDataPath: 'results',
          // Add "Custom Message" option at the end of the list
          appendOptions: [
            {
              value: 0,
              label: 'Custom Message',
              secondaryLabel: 'Write your own email message',
              separator: true,
            },
          ],
          // Auto-set other fields when specific template is selected
          autoSetFields: [
            {
              triggerValue: 0, // When "Custom Message" is selected
              fieldUpdates: {
                customMessage: '',
              },
            },
          ],
        } as DynamicSelectOptions,
      },

      {
        key: 'customMessage',
        label: 'Custom Message',
        type: 'textarea',
        required: false,
        placeholder: 'Enter your custom email message...',
        helpText: 'Email content (supports HTML)',
        showIf: {
          watchField: 'emailTemplateId',
          operator: 'equals',
          value: 0,
        },
      },
      
      {
        key: 'emailProvider',
        label: 'Email Provider',
        type: 'select',
        required: true,
        placeholder: 'Select email provider',
        helpText: 'Choose the email service provider to send the email',
        options: {
          endpoint: 'http://192.168.37.7:5001/api/EmailProvider/all',
          valueField: 'emailProviderId',
          displayField: 'displayName',
          showSearch: false,
          responseDataPath: 'results',
        } as DynamicSelectOptions,
      },
      {
        key: 'timeoutSeconds',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        placeholder: '60',
        default: 60,
        helpText:
          'Maximum time to wait for email delivery before triggering timeout exit (in seconds)',
      },

      
      {
        key: 'notificationGroups',
        label: 'User Groups',
        type: 'generic-selector',
        required: false,
        placeholder: 'Select groups',
        helpText: 'Select user groups to send email notifications',
        icon: "<span class='material-icons'>groups</span>",
        options: {
          endpoint: 'http://192.168.37.7:5001/api/NotificationUsers',
          valueField: 'notificationID',
          primaryDisplayField: 'name',
          secondaryDisplayField: 'description',
          searchLabel: 'Search User Groups',
          searchPlaceholder: 'Type to search groups...',
          selectedLabel: 'Selected Groups',
          emptyStateMessage: 'No groups selected yet',
          responseDataPath: 'results',
        } as GenericSelectorOptions,
      },
      {
        key: 'users',
        label: 'Users',
        type: 'generic-selector',
        required: false,
        placeholder: 'Select users',
        helpText: 'Select individual users to send email notifications',
        icon: "<span class='material-icons'>person</span>",
        options: {
          endpoint: 'http://192.168.37.7:5001/api/Users/all',
          valueField: 'userId',
          primaryDisplayField: 'fullName',
          secondaryDisplayField: 'email',
          searchLabel: 'Search Users',
          searchPlaceholder: 'Type to search users...',
          selectedLabel: 'Selected Users',
          emptyStateMessage: 'No users selected yet',
          responseDataPath: 'results',
        } as GenericSelectorOptions,
      },
    ],
    exits: ['onSuccess', 'onTimeout', 'onFailure'],
  },
  {
    type: 'action.pa',
    category: 'action',
    label: 'Public Address',
    description: 'Broadcast announcement over PA system',
    icon: "<span class='material-icons'>campaign</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      {
        key: 'paTemplateId',
        label: 'PA Template',
        type: 'select',
        required: true,
        placeholder: 'Select PA template',
        helpText: 'Choose a public address template or create a custom message',
        options: {
          endpoint:
            'http://192.168.37.7:5001/api/AlertChannelTemplate/by-provider/4',
          valueField: 'id',
          displayField: 'templateName',
          secondaryDisplayField: 'templateString',
          showSearch: true,
          responseDataPath: 'results',
          // Add "Custom Message" option at the end of the list
          appendOptions: [
            {
              value: 0,
              label: 'Custom Message',
              secondaryLabel: 'Write your own PA message',
              separator: true,
            },
          ],
          // Auto-set other fields when specific template is selected
          autoSetFields: [
            {
              triggerValue: 0, // When "Custom Message" is selected
              fieldUpdates: {
                customMessage: '',
              },
            },
          ],
        } as DynamicSelectOptions,
      },
      {
        key: 'customMessage',
        label: 'Custom Message',
        type: 'textarea',
        required: false,
        placeholder: 'Enter your custom PA announcement...',
        helpText: 'Custom public address announcement message',
        showIf: {
          watchField: 'paTemplateId',
          operator: 'equals',
          value: 0,
        },
      },
      {
        key: 'zone',
        label: 'PA Zone',
        type: 'select',
        required: true,
        placeholder: 'Select PA zone',
        helpText: 'Select the PA zone to broadcast to',
        options: {
          endpoint: 'http://192.168.37.7:5001/api/Lookups/GetZone',
          valueField: 'zoneId',
          displayField: 'name',
          secondaryDisplayField: 'regionName',
          showSearch: true,
          responseDataPath: 'results',
        } as DynamicSelectOptions,
      },
      {
        key: 'tone',
        label: 'Alert Tone',
        type: 'select',
        required: false,
        placeholder: 'Select alert tone',
        helpText: 'Tone to play before announcement',
        options: {
          endpoint: 'http://192.168.37.7:5001/api/AlertTone/all',
          valueField: 'alertToneId',
          displayField: 'name',
          secondaryDisplayField: 'description',
          showSearch: true,
          responseDataPath: 'results',
        } as DynamicSelectOptions,
      },
      {
        key: 'timeoutSeconds',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        placeholder: '60',
        default: 60,
        helpText:
          'Maximum time to wait for PA announcement completion before triggering timeout exit (in seconds)',
      },
    ],
    exits: ['onSuccess', 'onTimeout', 'onFailure'],
  },
  {
    type: 'action.ivr',
    category: 'action',
    label: 'Call Dialer',
    description: 'Make phone call with interactive voice response',
    icon: "<span class='material-icons'>phone</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      {
        key: 'callTemplateId',
        label: 'Call Template',
        type: 'select',
        required: true,
        placeholder: 'Select call template',
        helpText: 'Choose a call template or create a custom message',
        options: {
          endpoint:
            'http://192.168.37.7:5001/api/AlertChannelTemplate/by-provider/2',
          valueField: 'id',
          displayField: 'templateName',
          secondaryDisplayField: 'templateString',
          showSearch: true,
          responseDataPath: 'results',
          // Add "Custom Message" option at the end of the list
          appendOptions: [
            {
              value: 0,
              label: 'Custom Message',
              secondaryLabel: 'Write your own call message',
              separator: true,
            },
          ],
          // Auto-set other fields when specific template is selected
          autoSetFields: [
            {
              triggerValue: 0, // When "Custom Message" is selected
              fieldUpdates: {
                customMessage: '',
              },
            },
          ],
        } as DynamicSelectOptions,
      },
      {
        key: 'customMessage',
        label: 'Custom Message',
        type: 'textarea',
        required: false,
        placeholder: 'Enter your custom call message...',
        helpText: 'Custom call/IVR message (text-to-speech)',
        showIf: {
          watchField: 'callTemplateId',
          operator: 'equals',
          value: 0,
        },
      },

  
      {
        key: 'callDialerProvider',
        label: 'Call Dialer Provider',
        type: 'select',
        required: true,
        placeholder: 'Select call dialer provider',
        helpText: 'Choose the call dialer service provider',
        options: {
          endpoint: 'http://192.168.37.7:5001/api/CallDialerProvider/all',
          valueField: 'callDialerProviderId',
          displayField: 'displayName',
          showSearch: false,
          responseDataPath: 'results',
        } as DynamicSelectOptions,
      },
      {
        key: 'timeoutSeconds',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        placeholder: '60',
        default: 60,
        helpText:
          'Maximum time to wait for call completion before triggering timeout exit (in seconds)',
      },

          {
        key: 'notificationGroups',
        label: 'User Groups',
        type: 'generic-selector',
        required: false,
        placeholder: 'Select groups',
        helpText: 'Select user groups to call',
        icon: "<span class='material-icons'>groups</span>",
        options: {
          endpoint: 'http://192.168.37.7:5001/api/NotificationUsers',
          valueField: 'notificationID',
          primaryDisplayField: 'name',
          secondaryDisplayField: 'description',
          searchLabel: 'Search User Groups',
          searchPlaceholder: 'Type to search groups...',
          selectedLabel: 'Selected Groups',
          emptyStateMessage: 'No groups selected yet',
          responseDataPath: 'results',
        } as GenericSelectorOptions,
      },
      {
        key: 'users',
        label: 'Users',
        type: 'generic-selector',
        required: false,
        placeholder: 'Select users',
        helpText: 'Select individual users to call',
        icon: "<span class='material-icons'>person</span>",
        options: {
          endpoint: 'http://192.168.37.7:5001/api/Users/all',
          valueField: 'userId',
          primaryDisplayField: 'fullName',
          secondaryDisplayField: 'email',
          searchLabel: 'Search Users',
          searchPlaceholder: 'Type to search users...',
          selectedLabel: 'Selected Users',
          emptyStateMessage: 'No users selected yet',
          responseDataPath: 'results',
        } as GenericSelectorOptions,
      },
    ],
    exits: ['onSuccess', 'onTimeout', 'onFailure'],
  },
  {
    type: 'action.webhook',
    category: 'action',
    label: 'Webhook',
    description: 'Send HTTP request to external API',
    icon: "<span class='material-icons'>api</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      {
        key: 'method',
        label: 'HTTP Method',
        type: 'select',
        required: true,
        placeholder: 'Select HTTP method',
        helpText: 'HTTP method for the request',
        options: {
          options: ['POST', 'GET'],
          showSearch: false,
        } as DynamicSelectOptions,
        default: 'POST',
      },
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com/webhook',
        helpText: 'Full URL of the webhook endpoint',
      },
      {
        key: 'authentication',
        label: 'Authentication',
        type: 'text',
        required: false,
        placeholder: 'Bearer token or API key',
        helpText: 'Authentication header value (e.g., Bearer token, API key)',
      },
      {
        key: 'body',
        label: 'Request Body',
        type: 'textarea',
        required: false,
        placeholder: '{"message": "Alert triggered", "severity": "high"}',
        helpText: 'JSON body for the webhook request (for POST method)',
      },
      {
        key: 'responseVariable',
        label: 'Response Variable',
        type: 'text',
        required: false,
        placeholder: 'webhookResponse',
        helpText: 'Variable name to store the webhook response',
      },
      {
        key: 'timeoutSeconds',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        placeholder: '60',
        default: 60,
        helpText:
          'Maximum time to wait for webhook response before triggering timeout exit (in seconds)',
      },
    ],
    exits: ['onSuccess', 'onTimeout', 'onFailure'],
  },
  {
    type: 'action.database',
    category: 'action',
    label: 'Database Query',
    description: 'Execute database query or update',
    icon: "<span class='material-icons'>storage</span>",
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    nodeColor: 'bg-emerald-50 border-emerald-200',
    properties: [
      {
        key: 'ConnectionString',
        label: 'Connection String',
        type: 'text',
        required: true,
        placeholder:
          'Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;',
      },
      {
        key: 'query',
        label: 'SQL Query',
        type: 'textarea',
        required: true,
        placeholder:
          'INSERT INTO alert_logs (alert_id, timestamp, status) VALUES (?, ?, ?)',
        helpText: 'SQL query with parameter placeholders (?)',
      },
      {
        key: 'parameters',
        label: 'Parameters (JSON Array)',
        type: 'textarea',
        required: false,
        placeholder: '["{{alert.id}}", "{{timestamp}}", "PROCESSED"]',
        helpText: 'Array of parameter values',
      },
      {
        key: 'responseVariable',
        label: 'Response Variable',
        type: 'text',
        required: false,
        placeholder: 'webhookResponse',
        helpText: 'Variable name to store the webhook response',
      },
      {
        key: 'timeoutSeconds',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        placeholder: '60',
        default: 60,
        helpText:
          'Maximum time to wait for database query completion before triggering timeout exit (in seconds)',
      },
    ],
    exits: ['onSuccess', 'onTimeout', 'onFailure'],
  },

  // ============ TERMINALS ============
  {
    type: 'end.terminate',
    category: 'terminal',
    label: 'End',
    description: 'Terminate workflow execution',
    icon: "<span class='material-icons'>stop</span>",
    color: 'bg-slate-100 border-slate-300 text-slate-800',
    nodeColor: 'bg-slate-50 border-slate-200',
    properties: [
      {
        key: 'status',
        label: 'Exit Status',
        type: 'select',
        required: false,
        options: {
          options: ['success', 'failure', 'cancelled', 'timeout'],
        } as DynamicSelectOptions,
        default: 'success',
        helpText: 'Final status of the workflow',
      },
      {
        key: 'message',
        label: 'Exit Message',
        type: 'text',
        required: false,
        placeholder: 'Workflow completed successfully',
        helpText: 'Final status message',
      },
    ],
    exits: [],
  },

  // ============ UTILITY ============
  {
    type: 'utility.delay',
    category: 'utility',
    label: 'Delay',
    description: 'Add a delay before continuing',
    icon: "<span class='material-icons'>hourglass_empty</span>",
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    nodeColor: 'bg-gray-50 border-gray-200',
    properties: [
      {
        key: 'duration',
        label: 'Delay Duration',
        type: 'number',
        required: true,
        placeholder: '5',
        helpText: 'Delay in seconds',
      },
    ],
    exits: ['next'],
  },
  {
    type: 'utility.log',
    category: 'utility',
    label: 'Log Entry',
    description: 'Write log entry for debugging',
    icon: "<span class='material-icons'>article</span>",
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    nodeColor: 'bg-gray-50 border-gray-200',
    properties: [
      {
        key: 'level',
        label: 'Log Level',
        type: 'select',
        required: true,
        options: {
          options: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
        } as DynamicSelectOptions,
        default: 'INFO',
      },
      {
        key: 'message',
        label: 'Log Message',
        type: 'textarea',
        required: true,
        placeholder: 'Workflow step executed: {{step.name}}',
        helpText: 'Log message with optional variable substitution',
      },
    ],
    exits: ['next'],
  },
];
