import clsx from 'clsx'
import React from 'react'

export const UpVoteIcon = ({ stroke = '#666', fill = 'none', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    id="Capa_1"
    {...props}
    className={clsx(props.className)}
  >
    <path d="M12 4 3 15h6v5h6v-5h6z" strokeWidth=".5" stroke={stroke} fill={fill} strokeLinejoin="round"></path>
  </svg>
)

export const DownVoteIcon = ({ stroke = '#666', fill = 'none', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    {...props}
    className={clsx(props.className)}
  >
    <path d="m12 20 9-11h-6V4H9v5H3z" stroke={stroke} fill={fill} strokeWidth=".5" strokeLinejoin="round" />
  </svg>
)

export const ClockIcon = ({ stroke = '#666', fill = 'none', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={clsx(props.className, 'h-6 w-6')}
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
