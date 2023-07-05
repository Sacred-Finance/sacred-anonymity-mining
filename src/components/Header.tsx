import React from 'react'
import { useTranslation } from 'next-i18next'
import { DynamicLogo } from './Logo'
import { NavBarButton } from '../components/buttons/NavBarButton'
import { PrimaryButton } from '../components/buttons'
import { ThemeToggleButton } from './Theme'
import {PlusCircleIcon, QuestionMarkCircleIcon} from '@heroicons/react/20/solid'
import ConnectWallet from './Connect/ConnectWallet'
import {buttonVariants, primaryButtonStyle} from "../styles/classes";
import clsx from "clsx";
import Link from "next/link";

type HeaderProps = {
    createCommunity(): any
}

const Header = ({ createCommunity, ...headerProps }: HeaderProps) => {
    const { t } = useTranslation()

    return (
        <nav className="my-1 grid grid-cols-1 md:grid-cols-6 items-center gap-1 p-2 dark:bg-gray-900  justify-items-center">
            <div className="flex items-center justify-start h-full justify-items-center">
                <NavBarButton href="/" className="h-full">
                    <div className="md:hidden h-full"><DynamicLogo className="h-10" /></div>
                    <div className="hidden md:block"><DynamicLogo className='h-[64px] w-[150px]' /></div>
                </NavBarButton>
            </div>

            <div className="col-span-2 flex items-center  gap-8 ">
                <Link href={'/create-group'} className={clsx(primaryButtonStyle, buttonVariants.primarySolid )}>
                    <div className="flex gap-2 ">
                        <PlusCircleIcon className="h-6 w-6" /> {t('toolTip.createCommunity')}
                    </div>
                </Link>
            </div>

            <div className="col-span-2 ">
                <ConnectWallet />

            </div>

            <div className="flex items-center justify-end gap-2">
                <NavBarButton href="https://www.thatsacred.place/help" target="_blank" rel="noopener noreferrer">
                    <QuestionMarkCircleIcon className="w-8" />
                </NavBarButton>
                <ThemeToggleButton />
            </div>
        </nav>
    )
}

export default Header
