// Header/Navbar
import clsx from 'clsx'

const header = 'dark:bg-background-900 text-white dark:text-white border-b-2'

// Footer
const footer = 'dark:bg-background-900  border-t-2'

// Buttons
const primaryButton = ''

const secondaryButton =
  'bg-secondary-200 text-white hover:bg-secondary-200  dark:hover:bg-secondary-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary-200'

const input =
  'rounded-lg border-0 bg-background-dark  p-2  text-white focus:outline-none focus:ring-2 focus:ring-primary-dark ring-1 ring-white my-2 placeholder-white/40'

// Sidebars
const sidebar = 'dark:bg-background-900 text-white dark:text-white border-r-2'

// Cards
const card = 'dark:bg-background-900 text-white dark:text-white border-2 rounded-md'

// Modal/Dialog
const modal = 'dark:bg-background-900 text-white dark:text-white border-2 rounded-md shadow-lg'

// Carousel/Slider
const carousel = 'dark:bg-background-900 text-white dark:text-white'

// Accordions
const accordion = 'dark:bg-background-900 text-white dark:text-white border-t-2'

// Dropdowns
const dropdown = 'dark:bg-background-900 text-white dark:text-white border-2 rounded-md'

// Tooltips
const tooltip = 'dark:bg-background-900 text-white dark:text-white border-2 rounded-md'

// Alerts/Notifications
const alert = 'dark:bg-error-500 text-white border-2 rounded-md px-4 py-2'

// Breadcrumbs
const breadcrumb = 'dark:bg-background-900  '

// Tabs
const tab = 'dark:bg-background-900 text-white dark:text-white border-b-2'

// Badges/Labels
const badge = 'dark:bg-primary-500 text-white rounded-full px-2 py-1'

// Progress Bars
const progressBar = 'bg-primary-500 dark:bg-purple-200 rounded-full'

// Loaders/Spinners
const loader = 'dark:text-primary-500'

// Pagination
const pagination = 'dark:bg-background-900 text-white dark:text-white border-r-2'

// Popovers
const popover = 'dark:bg-background-900 text-white dark:text-white border-2 rounded-md'

// Datepicker
const datepicker = 'dark:bg-background-900 text-white dark:text-white border-2 rounded-md'

// Tables/Data Grid
const table = 'dark:bg-background-900 text-white dark:text-white border-2'

// List View
const listView = 'dark:bg-background-900 text-white dark:text-white border-b-2'

// Forms
const form = 'dark:bg-background-900 text-white dark:text-white border-2 rounded-md'

// Validation Messages
const validationMessage = 'text-error-500 dark:text-error-500'

// Snackbars
const snackbar = 'dark:bg-background-900 text-white dark:text-white border-t-2'

export const classes = {
  header,
  footer,
  primaryButton,
  secondaryButton,
  sidebar,
  card,
  modal,
  carousel,
  accordion,
  dropdown,
  tooltip,
  alert,
  breadcrumb,
  tab,
  badge,
  progressBar,
  loader,
  pagination,
  popover,
  table,
  listView,
  form,
  validationMessage,
  snackbar,
  input,
}

// exclusively color related classes, for use in conjunction with other classes, hover, focus, active, selected, border etc. includes dark mode variants
export const buttonVariants = {
  primary:
    'text-primary-500 dark:text-primary-500 hover:text-primary-600 dark:hover:text-primary-600 focus:text-primary-600 dark:focus:text-primary-600 active:text-primary-600 dark:active:text-primary-600 selected:text-primary-600 dark:selected:text-primary-600 ' +
    'border-primary-500 dark:border-primary-500 hover:border-primary-600 dark:hover:border-primary-600 ',
  primaryOutline:
    'text-primary-500 dark:text-primary-500 hover:text-primary-600 dark:hover:text-primary-600 focus:text-primary-600 dark:focus:text-primary-600 active:text-primary-600 dark:active:text-primary-600 selected:text-primary-600 dark:selected:text-primary-600 ' +
    'border-primary-500 dark:border-primary-500 hover:border-primary-600 dark:hover:border-primary-600 ',
  primarySolid:
      'text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-700 active:bg-primary-700',
  solid:'text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-700 active:bg-primary-700',

  primarySolidOutline:
    'text-primary-500 dark:text-primary-500 hover:text-primary-600 dark:hover:text-primary-600 focus:text-primary-600 dark:focus:text-primary-600 active:text-primary-600 dark:active:text-primary-600 selected:text-primary-600 dark:selected:text-primary-600 ' +
    'border-primary-500 dark:border-primary-500 hover:border-primary-600 dark:hover:border-primary-600 ',

  secondary:
    'text-secondary-500 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-600 focus:text-secondary-600 dark:focus:text-secondary-600 active:text-secondary-600 dark:active:text-secondary-600 selected:text-secondary-600 dark:selected:text-secondary-600 ' +
    'border-secondary-500 dark:border-secondary-500 hover:border-secondary-600 dark:hover:border-secondary-600 focus:border-secondary-600 dark:focus:border-secondary-600 active:border-secondary-600 dark:active:border-secondary-600  dark:selected:border-secondary-600',
  success:
    'text-success-500 dark:text-success-500 hover:text-success-600 dark:hover:text-success-600 focus:text-success-600 dark:focus:text-success-600 active:text-success-600 dark:active:text-success-600 selected:text-success-600 dark:selected:text-success-600 ' +
    'border-success-500 dark:border-success-500 hover:border-success-600 dark:hover:border-success-600 focus:border-success-600 dark:focus:border-success-600 active:border-success-600 dark:active:border-success-600 selected:border-success-600 dark:selected:border-success-600',
  error:
    'text-error-500 dark:text-error-500 hover:text-error-600 dark:hover:text-error-600 focus:text-error-600 dark:focus:text-error-600 active:text-error-600 dark:active:text-error-600 selected:text-error-600 dark:selected:text-error-600 ' +
    'border-error-500 dark:border-error-500 hover:border-error-600 dark:hover:border-error-600 focus:border-error-600 dark:focus:border-error-600 active:border-error-600 dark:active:border-error-600 selected:border-error-600 dark:selected:border-error-600',
}

export const primaryButtonStyle = clsx(
  ' !focus-none !select-none p-2 text-center content-center align-middle  shadow-none  rounded-lg  focus:outline-none focus:text-bold active:scale-95 transition-transform duration-100 ease-in-out'
)

// The following Tailwind theme aspires to be a reproduction of the
// default optional Genesis CSS theme that ships with FormKit
