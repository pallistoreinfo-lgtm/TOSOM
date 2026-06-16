"use client";

import * as React from "react";
import { site } from "@/config/site";

/** Calendly inline embed. Lazy-loads the widget script on mount. */
export function CalendlyEmbed({ url = site.integrations.calendlyUrl }: { url?: string }) {
  React.useEffect(() => {
    const id = "calendly-widget-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="my-6">
      <div className="calendly-inline-widget" data-url={url} style={{ minWidth: 320, height: 700 }} />
    </div>
  );
}

/** JotForm gut-health quiz embed. */
export function GutQuiz({ id = site.integrations.jotformGutQuizId }: { id?: string }) {
  return (
    <div className="my-6">
      <iframe
        title="Gut Health Quiz"
        src={`https://form.jotform.com/${id}`}
        className="h-[800px] w-full rounded-md border"
        loading="lazy"
      />
    </div>
  );
}

/** YouTube embed used by migrated article bodies. */
export function YouTube({ id }: { id: string }) {
  return (
    <div className="my-6 aspect-video w-full overflow-hidden rounded-md">
      <iframe
        title="YouTube video"
        src={`https://www.youtube.com/embed/${id}`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
