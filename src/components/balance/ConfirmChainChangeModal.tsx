import { FC, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BsArrowRight } from "react-icons/bs";
import { SiWebassembly, SiEthereum } from "react-icons/si";
import { Chain } from "@src/contants/chains";

interface ConfirmChainChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chainToChange: Chain | null;
}

export const ConfirmChainChangeModal: FC<ConfirmChainChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  chainToChange,
}) => {
  const changeIsToEVM = chainToChange?.supportedAccounts[0].includes("EVM");

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-custom-gray-bg text-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 "
                >
                  Change to {chainToChange?.supportedAccounts[0] || ""}
                </Dialog.Title>

                <div className="flex justify-center gap-3 items-center py-3">
                  {changeIsToEVM ? (
                    <SiWebassembly size={22} />
                  ) : (
                    <SiEthereum size={22} />
                  )}

                  <BsArrowRight size={20} />

                  {changeIsToEVM ? (
                    <SiEthereum size={22} />
                  ) : (
                    <SiWebassembly size={22} />
                  )}
                </div>

                <div className="mt-2">
                  <p className="text-sm">
                    {`${chainToChange?.name || ""} only support ${
                      chainToChange?.supportedAccounts[0].toLowerCase() || ""
                    } accounts. Make sure bla bla bla.`}
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium  outline-0"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-custom-green-bg px-4 py-2 text-sm font-medium"
                    onClick={onConfirm}
                  >
                    Change
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};