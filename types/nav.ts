export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<any>;
  label?: string;
  description?: string;
  hasDropdown?: boolean;
  dropdownItems?: {
    label: string;
    href: string;
  }[];
}
