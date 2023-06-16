import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import WaitingAnimation from "../../public/waiting.json";
import { useLoaderContext } from "../contexts/LoaderContext";

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
            <div className="relative bg-white rounded-lg w-64 h-64 p-4">
              {/* Replace the commented line with your Lottie animation */}
              {/* <Lottie options={defaultOptions} height={500} width={500} /> */}
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
  );
}
