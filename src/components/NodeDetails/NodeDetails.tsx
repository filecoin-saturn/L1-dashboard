import bytes from "bytes";
import { Fragment, useContext } from "react";
import { closeNodeDetailsAction } from "../../state/actions";
import { Dialog, Transition } from "@headlessui/react";
import { SidebarCollapseIcon } from "@primer/octicons-react";
import { DispatchContext, StateContext } from "../../state/Context";

function NodeDetails({ node }: any) {
  return (
    <div className="mt-5 border-t border-gray-200 px-4 py-5 text-slate-200 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-1 gap-y-2 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm text-slate-400">Node details</dt>
          <dd className="mt-1 text-sm">State: {node.state}</dd>
          <dd className="mt-1 text-sm">Version: {node.version}</dd>
          <dd className="mt-1 text-sm">Level: {node.level}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm text-slate-400">Dates</dt>
          <dd className="mt-1 text-sm">Created: {node.createdAt}</dd>
          <dd className="mt-1 text-sm">Last reg: {node.lastRegistration}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm text-slate-400">Disk stats</dt>
          <dd className="mt-1 text-sm">Available: {bytes(node.diskStats.availableDisk * 1024 * 1024 * 1024)}</dd>
          <dd className="mt-1 text-sm">Total: {bytes(node.diskStats.totalDisk * 1024 * 1024 * 1024)}</dd>
          <dd className="mt-1 text-sm">Used: {bytes(node.diskStats.usedDisk * 1024 * 1024 * 1024)}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm text-slate-400">Memory stats</dt>
          <dd className="mt-1 text-sm">Available: {bytes(node.memoryStats.availableMemory * 1024 * 1024 * 1024)}</dd>
          <dd className="mt-1 text-sm">Total: {bytes(node.memoryStats.totalMemory * 1024 * 1024 * 1024)}</dd>
          <dd className="mt-1 text-sm">Free: {bytes(node.memoryStats.freeMemory * 1024 * 1024 * 1024)}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm text-slate-400">Location & ISP</dt>
          <dd className="mt-1 text-sm">ISP: {node.ispShort}</dd>
          <dd className="mt-1 text-sm">
            {node.geoloc.country}, {node.geoloc.region}, {node.geoloc.city}
          </dd>
        </div>
        {node.HealthCheckFailures.length > 0 && (
          <div className="col-span-2">
            <dt className="text-sm text-slate-400">Health Check Failures</dt>
            {node.HealthCheckFailures.map((failure: any, index: number) => (
              <dd className="mt-1 text-sm" key={index}>
                <span className="mr-1 text-slate-400">
                  {new Date(failure.created_at).toLocaleDateString()}{" "}
                  {new Date(failure.created_at).toLocaleTimeString()}
                </span>
                {failure.reason}
              </dd>
            ))}
          </div>
        )}
      </dl>
    </div>
  );
}

export default function NodeDetailsPanel() {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const open = Boolean(state.nodeDetails);
  const onClose = () => {
    const action: closeNodeDetailsAction = { type: "CLOSE_NODE_DETAILS" };

    dispatch(action);
  };

  if (!state.nodes) return null;

  const node = state.nodeDetails && state.nodes.find(({ id }: any) => id === state.nodeDetails);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="pointer-events-none relative z-10" onClose={() => undefined}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-slate-700 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-slate-200">{node?.id}</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md text-slate-200 hover:text-gray-500 focus:outline-none"
                            onClick={() => onClose()}
                          >
                            <span className="sr-only">Close panel</span>
                            <SidebarCollapseIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {node && <NodeDetails node={node} />}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
