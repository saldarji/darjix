"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    calendar?: {
      schedulingButton: {
        load: (config: {
          url: string;
          color?: string;
          label?: string;
          target: HTMLElement;
        }) => void;
      };
    };
  }
}

export default function CalendarBooking() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const initCalendar = (currentTheme: "light" | "dark" = theme) => {
    if (window.calendar?.schedulingButton && targetRef.current) {
      targetRef.current.innerHTML = "";
      window.calendar.schedulingButton.load({
        url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1WiCFAHXDJyqD9IFfRmZ6gmgFnS3WSht9ogpxAD8_xnJrIxThvQEFraOnl9xJT8CUDK9u5IUgt?gv=true",
        color: currentTheme === "dark" ? "#1f2937" : "#000000",
        label: "Book with Sal",
        target: targetRef.current,
      });
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.body.classList.add("gcal-dark-popover");
    } else {
      document.body.classList.remove("gcal-dark-popover");
    }
    initCalendar(newTheme);
  };

  useEffect(() => {
    if (window.calendar?.schedulingButton) {
      initCalendar(theme);
    }
    return () => {
      document.body.classList.remove("gcal-dark-popover");
    };
  }, []);

  return (
    <>
      <link
        href="https://calendar.google.com/calendar/scheduling-button-script.css"
        rel="stylesheet"
      />
      <Script
        src="https://calendar.google.com/calendar/scheduling-button-script.js"
        onLoad={() => initCalendar(theme)}
        strategy="lazyOnload"
      />
      <div className="my-8 p-6 bg-gray-50 border border-gray-200 rounded">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-black">Connect & Book a Meeting</h2>
          <div className="flex items-center space-x-1 text-xs text-gray-500 bg-white border border-gray-200 rounded p-1 self-start sm:self-auto">
            <span className="px-1.5 font-medium">Popover Mode:</span>
            <button
              onClick={() => handleThemeChange("light")}
              className={`px-2 py-1 rounded transition-colors ${
                theme === "light"
                  ? "bg-black text-white font-medium"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              ☀️ White
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`px-2 py-1 rounded transition-colors ${
                theme === "dark"
                  ? "bg-gray-900 text-white font-medium"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              🌙 Dark
            </button>
          </div>
        </div>
        <p className="text-base text-gray-600 mb-4">
          Want to chat about AI projects, higher education, or potential collaborations? Schedule a time directly on my calendar:
        </p>
        <div ref={targetRef} className="inline-block" />
      </div>
    </>
  );
}

