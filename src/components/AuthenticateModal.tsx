import { useFormik } from "formik";
import { Fragment, useContext, useEffect, useState } from "react";
import { closeAuthModalAction } from "../state/actions";
import { Dialog, Transition } from "@headlessui/react";
import getAuthorizationToken, { setStoredAuthorizationToken } from "../services/statsAuthorization";
import { DispatchContext, StateContext } from "../state/Context";
import Spinner from "./Spinner";

export default function AuthenticateModal() {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const [requestError, setRequestError] = useState<string>("");

  const setClose = () => {
    dispatch({ type: "CLOSE_AUTH_MODAL" } as closeAuthModalAction);
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      remember: false,
    },
    onSubmit: async (values, { resetForm }) => {
      setRequestError("");
      try {
        const authorizationToken = await getAuthorizationToken(values.username, values.password);

        setStoredAuthorizationToken(authorizationToken, values.remember);
        dispatch({ type: "USER_AUTHENTICATED", authorizationToken });

        resetForm();
      } catch (error: any) {
        setRequestError(error.message ?? "An unexpected error occurred");
      }
    },
  });

  useEffect(() => {
    if (!state.authModalOpen) {
      formik.resetForm();
      setRequestError("");
    }
  }, [state.authModalOpen, formik.resetForm, setRequestError]);

  return (
    <Transition.Root show={state.authModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10 text-slate-200" onClose={setClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-slate-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <form className="space-y-6" onSubmit={formik.handleSubmit}>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium">
                      Username
                    </label>
                    <div className="mt-1">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        autoComplete="username"
                        onChange={formik.handleChange}
                        value={formik.values.username}
                        className="block w-full appearance-none rounded-md border border-gray-300 bg-slate-800 px-3 py-2 placeholder-slate-200 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        onChange={formik.handleChange}
                        value={formik.values.password}
                        className="block w-full appearance-none rounded-md border border-gray-300 bg-slate-800 px-3 py-2 placeholder-slate-200 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        onChange={formik.handleChange}
                        checked={formik.values.remember}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm">
                        Remember me
                      </label>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      {formik.isSubmitting ? <Spinner /> : "Authenticate"}
                    </button>
                  </div>

                  {requestError && <p className="text-sm text-red-500">{requestError}</p>}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
