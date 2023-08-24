import { useEffect, useState } from "react";
import classNames from "classnames";

export default function GridButton({ children, onClick, className, testId }: any) {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    let timeoutId: any;

    if (clicked) {
      timeoutId = setTimeout(() => {
        setClicked(false);
      }, 500);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [clicked]);

  return (
    <button
      data-testid={testId}
      type="button"
      onClick={() => {
        setClicked(true);

        onClick();
      }}
      className={classNames(
        "inline-flex items-center rounded-md border border-transparent px-2 py-1 text-xs font-medium leading-4 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2",
        {
          "bg-primary": clicked,
          "bg-slate-700 duration-300 ease-out hover:bg-slate-600": !clicked,
        },
        className
      )}
    >
      {children}
    </button>
  );
}
