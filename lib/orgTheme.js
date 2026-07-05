/**
 * orgTheme.js — Admin web app org-type theming utility.
 * Single source of truth for colours, labels, icons per org type.
 *
 * Palette follows the LimaHealth design system:
 *   Teal   #0CAF87  — cross-app brand anchor (health, trust)
 *   Purple #6C5CE7  — mental-health / counselor features
 *   Navy   #0D3B7A  — authority (super-admin shell)
 *   Amber  #F9A825  — alerts / nudges
 */

export const ORG_THEMES = {
  SCHOOL: {
    primary:       '#0CAF87',   // teal — health brand
    primaryLight:  '#EBF9F5',
    primaryRing:   '#9FE1CB',
    primaryText:   '#0F6E56',
    gradient:      'from-[#0CAF87] to-[#0F6E56]',
    shadow:        'shadow-teal-100',
    memberLabel:   'Student',
    membersLabel:  'Students',
    supportLabel:  'Counselor',
    supportsLabel: 'Counselors',
    orgLabel:      'School',
    tagline:       'Student wellness management',
    icon:          '🏫',
  },
  COMPANY: {
    primary:       '#6C5CE7',   // purple — professional energy
    primaryLight:  '#E9E6FE',
    primaryRing:   '#AFA9EC',
    primaryText:   '#534AB7',
    gradient:      'from-[#6C5CE7] to-[#534AB7]',
    shadow:        'shadow-violet-100',
    memberLabel:   'Employee',
    membersLabel:  'Employees',
    supportLabel:  'Wellness Coach',
    supportsLabel: 'Wellness Coaches',
    orgLabel:      'Company',
    tagline:       'Employee wellness management',
    icon:          '🏢',
  },
  HOSPITAL: {
    primary:       '#0D3B7A',   // navy — clinical authority
    primaryLight:  '#E8EEF8',
    primaryRing:   '#85B7EB',
    primaryText:   '#0C447C',
    gradient:      'from-[#0D3B7A] to-[#0C447C]',
    shadow:        'shadow-blue-100',
    memberLabel:   'Staff',
    membersLabel:  'Staff Members',
    supportLabel:  'Therapist',
    supportsLabel: 'Therapists',
    orgLabel:      'Hospital',
    tagline:       'Staff wellness management',
    icon:          '🏥',
  },
  NGO: {
    primary:       '#F9A825',   // amber — warm community
    primaryLight:  '#FEF3CD',
    primaryRing:   '#FAC775',
    primaryText:   '#B45309',
    gradient:      'from-[#F9A825] to-[#B45309]',
    shadow:        'shadow-amber-100',
    memberLabel:   'Member',
    membersLabel:  'Members',
    supportLabel:  'Support Worker',
    supportsLabel: 'Support Workers',
    orgLabel:      'NGO',
    tagline:       'Member wellness management',
    icon:          '🤝',
  },
};

export const DEFAULT_THEME = ORG_THEMES.SCHOOL;

export function getOrgTheme(orgType) {
  return ORG_THEMES[orgType] ?? DEFAULT_THEME;
}
