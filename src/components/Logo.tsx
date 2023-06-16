import logo from "../../public/sacred-logos-wordmark.svg";
import logoLight from "../../public/sacred-logos-wordmark-light.svg";
import mobileLogo from "../../public/logo.svg";
import React from "react";
import Image from "next/image";
import {useTheme} from "next-themes";

export const Logo = (props: any) => {
  const { resolvedTheme, setTheme } = useTheme()


   return <Image src={resolvedTheme ==='dark' ? logoLight :logo} width={200}  alt={logo} {...props}/>;
};
export const MobileLogo = (props: any) => {
  const { resolvedTheme, setTheme } = useTheme()


   return <Image src={mobileLogo} className={'w-16'}  alt={logo} {...props}/>;
};
