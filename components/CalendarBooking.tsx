"use client";

import { useEffect, useRef } from "react";
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

  const initCalendar = () => {
    if (window.calendar?.schedulingButton && targetRef.current) {
      targetRef.current.innerHTML = "";
      window.calendar.schedulingButton.load({
        url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1WiCFAHXDJyqD9IFfRmZ6gmgFnS3WSht9ogpxAD8_xnJrIxThvQEFraOnl9xJT8CUDK9u5IUgt?gv=true",
        color: "#000000",
        label: "Book with Sal",
        target: targetRef.current,
      });
    }
  };

  useEffect(() => {
    if (window.calendar?.schedulingButton) {
      initCalendar();
    }
  }, []);

  return (
    <>
      <link
        href="https://calendar.google.com/calendar/scheduling-button-script.css"
        rel="stylesheet"
      />
      <Script
        src="https://calendar.google.com/calendar/scheduling-button-script.js"
        onLoad={initCalendar}
        strategy="lazyOnload"
      />
      <div className="my-8 p-6 bg-gray-50 border border-gray-200 rounded">
        <h2 className="text-xl font-bold text-black mb-2">Connect & Book a Meeting</h2>
        <p className="text-base text-gray-600 mb-4">
          Want to chat about AI projects, higher education, or potential collaborations? Schedule a time directly on my calendar:
        </p>
        <div ref={targetRef} className="inline-block" />
      </div>
    </>
  );
}
