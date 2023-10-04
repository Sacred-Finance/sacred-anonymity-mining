import { Tab } from '@headlessui/react'
import React from 'react'
import clsx from 'clsx'

const tabClass = selected => {
  console.log('selected', selected)
  return clsx(
    'focus:outline-none  rounded-full select:none ring-0 select:ring-none',
    selected ? 'text-primary-400' : 'text-gray-500'
  )
}

type TabTypes = 'community' | 'gas' | 'chat'

interface TabProperties {
  hidden: boolean
  onClick: () => void
  panel: React.ReactNode
  defaultIndex?: number
}

interface CommunityActionTabsProps {
  tabs: {
    [key in TabTypes]?: TabProperties
  }
  defaultTab?: TabTypes
}

const hiddenOrUndefined = (tab: TabProperties) => tab?.hidden || !tab

export const CommunityActionTabs = (props: CommunityActionTabsProps) => {
  const panels = Object.keys(props.tabs).map((tab, index) => {
    if (hiddenOrUndefined(props.tabs[tab as TabTypes])) {
      return null
    }
    return <Tab.Panel key={tab}>{props.tabs[tab as TabTypes].panel}</Tab.Panel>
  })

  const tabs = Object.keys(props.tabs).map(tab => {
    if (hiddenOrUndefined(props.tabs[tab as TabTypes])) {
      return null
    }
    return (
      <Tab key={tab} className={({ selected }) => tabClass(selected)} onClick={props.tabs[tab as TabTypes].onClick}>
        {TabIcons[tab as TabTypes]}
      </Tab>
    )
  })

  const defaultIndex = Object.keys(props.tabs).findIndex(tab => tab === props.defaultTab)
  return (
    <Tab.Group defaultIndex={defaultIndex}>
      <Tab.List className={'flex items-center gap-2 px-4'}>{tabs}</Tab.List>
      <Tab.Panels>{panels}</Tab.Panels>
    </Tab.Group>
  )
}

const BaseSVG = ({ children, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="white"
      className="h-full max-h-[52px] w-full max-w-[52px]"
      {...props}
    >
      {children}
    </svg>
  )
}

const CommunityIcon = () => {
  return (
    <BaseSVG xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </BaseSVG>
  )
}

const ChatIcon = () => {
  return (
    <BaseSVG>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </BaseSVG>
  )
}

const GasPumpIcon = () => {
  return (
    <BaseSVG viewBox="0 0 460 460">
      <g>
        <path
          d="M400.927,348.367c-1.811-17.321-9.423-36.684-22.628-57.546c-22.174-35.033-34.9-77.122-38.064-125.559l34.164-21.773
			c0.844-0.543,1.62-1.201,2.307-1.954c1.392-1.53,2.36-3.39,2.804-5.38l11.253-50.745c1.128-5.087-1.279-10.377-5.858-12.865
			L351.958,54.63c-0.6-0.325-1.241-0.602-1.908-0.825l31.027-43.869c0.615-0.869,0.427-2.069-0.429-2.705l-9.199-6.844
			c-0.854-0.635-2.057-0.47-2.714,0.366L329.843,51.14c-0.779,1.006-1.316,2.191-1.554,3.426l-16.599,86.586
			c-0.192,0.891-0.05,1.513,0.142,2.229l6.888,20.68c3.1,53.125,16.975,99.463,41.495,138.206
			c20.023,31.637,25.162,59.32,13.746,74.051c-6.688,8.627-18.604,11.748-30.371,7.955c-16.084-5.189-26.139-21.072-26.892-42.483
			c-1.55-44.041-19.301-83.61-51.334-114.431c-6.973-6.709-13.9-12.313-20.257-16.91v-7.154h10.67
			c10.728,0,19.795-7.939,21.212-18.571l21.4-160.493c0.816-6.115-1.047-12.284-5.111-16.926C289.216,2.661,283.347,0,277.178,0
			H27.342c-6.17,0-12.038,2.662-16.102,7.303c-4.064,4.641-5.927,10.811-5.111,16.926l21.4,160.493
			c1.417,10.632,10.486,18.571,21.213,18.571h10.67v95.225h-6.924c-11.819,0-21.4,9.582-21.4,21.4v65.801
			c0,11.818,9.581,21.4,21.4,21.4h199.545c11.818,0,21.399-9.582,21.399-21.4v-65.801c0-11.818-9.581-21.4-21.399-21.4h-6.925
			v-60.721c1.983,1.743,3.983,3.584,5.984,5.528c27.98,27.185,42.857,60.565,44.219,99.215
			c1.276,36.276,22.382,55.862,41.708,62.099c5.527,1.783,11.102,2.646,16.54,2.646c14.683,0,28.362-6.305,37.317-17.859
			C399.145,378.758,402.62,364.561,400.927,348.367z M365.907,88.96l-7.669,39.05l-18.193,9.649l4.506-60.312L365.907,88.96z
			 M237.043,160.493H67.478L51.786,42.8h200.95L237.043,160.493z"
        />
        <path
          d="M154.239,113.758l-37.012-55.146c-0.807-1.204-2.383-1.704-3.764-1.114c-1.559,0.67-2.283,2.477-1.617,4.038
			l26.124,61.061c-3.005,5.188-3.315,11.77-0.245,17.423c4.69,8.632,15.491,11.828,24.124,7.139
			c8.633-4.69,11.828-15.491,7.139-24.123C165.916,117.382,160.226,114.061,154.239,113.758z"
        />
      </g>
    </BaseSVG>
  )
}

export const TabIcons = {
  community: <CommunityIcon />,
  chat: <ChatIcon />,
  gas: <GasPumpIcon />,
}
