import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import WaitingAnimation from "../../public/waiting.json";
import { useLoaderContext } from "../contexts/LoaderContext";
import { motion } from "framer-motion";

export function LoaderComponent() {
  const { isLoading, setIsLoading } = useLoaderContext();
  const cancelRef = useRef<HTMLDivElement>(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: WaitingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const LoadingIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
  );
  return (
      <Transition.Root show={isLoading} as={Fragment}>
        <Dialog
            as="div"
            static
            open={isLoading}
            onClose={() => setIsLoading(false)}
            initialFocus={cancelRef}
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black opacity-50"></div>

          <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          <Transition.Child
              as={Fragment}
              enter="transition-transform ease-out duration-300"
              enterFrom="scale-95"
              enterTo="scale-100"
              leave="transition-transform ease-in duration-200"
              leaveFrom="scale-100"
              leaveTo="scale-95"
          >
            <div className="relative bg-white rounded w-64 h-64 p-4">
              <div className="w-full  flex items-center justify-center bg-pink-400">
                <motion.div
                    className="text-white"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                >
                  <LoadingIcon />
                </motion.div>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
  );
}
