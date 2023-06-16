export function CustomModal({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  if (isOpen)
    return (
      <div className={'fixed inset-0 top-0 left-0 z-50  translate-x-[0%] translate-y-[0%] bg-black bg-opacity-50'}>
        <div className={'absolute inset-0 flex items-center justify-center '}>
          <div className={' w-full max-w-2xl '}>{children}</div>
        </div>
      </div>
    )
  else return <></>
}
