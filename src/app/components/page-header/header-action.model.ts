export type HeaderActionKind = 'btn' | 'toggleView' | 'search' | 'spliter';

export interface HeaderAction {
  id?: string;
  kind: HeaderActionKind;
  label?: string;
  tooltip?: string;
  icon?: string;
  iconToggle?: string;
  class?: string;
  disabled?: boolean;
  state?: number;
  placeholder?: string;
  onClick?: () => void;
  onToggle?: (state: 0 | 1) => void;
  onSearch?: (query: string) => void;
}