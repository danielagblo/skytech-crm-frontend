"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { ratingsService } from "@/services/ratings.service";
import type { RatingInfoResponse } from "@/types/rating.types";

const STAR_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

export const RatingPage = ({ token }: { token: string }) => {
  const [info, setInfo] = useState<RatingInfoResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [clientName, setClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    ratingsService
      .info(token)
      .then((response) => {
        if (active) setInfo(response.data.data);
      })
      .catch((error) => {
        if (active)
          setLoadError(
            getApiErrorMessage(error, "This rating link is invalid or expired."),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const finish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !info) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await ratingsService.submit(token, {
        ratingId: info.id,
        rating: selected,
        feedback: feedback.trim() || undefined,
        clientName: clientName.trim() || undefined,
      });
      setDone(true);
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "The rating could not be submitted."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Shell>
        <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      </Shell>
    );

  if (loadError)
    return (
      <Shell>
        <div className="py-6 text-center">
          <Star className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Unable to rate</h1>
          <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        </div>
      </Shell>
    );

  if (!info) return null;

  if (done || info.rated)
    return (
      <Shell>
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h1 className="mt-4 text-2xl font-semibold">
            {done ? "Thank you!" : "Thanks, done already!"}
          </h1>
          <div className="mt-4 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={cn(
                  "h-8 w-8",
                  value <= (done ? selected : (info.rating ?? 0))
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-muted-foreground/40",
                )}
              />
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Your feedback about {info.agentName} helps the Skytech team deliver
            a better experience for every client.
          </p>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <div className="text-center">
        <p className="eyebrow">Skytech client feedback</p>
        <h1 className="mt-2 text-2xl font-semibold">
          How did {info.agentName} do?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You recently discussed <span className="font-medium">{info.dealTitle}</span> — tell us how it went.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={finish}>
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const active = value <= (hovered || selected);
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value > 1 ? "s" : ""} — ${STAR_LABELS[value - 1]}`}
                  onMouseEnter={() => setHovered(value)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(value)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={cn(
                      "h-11 w-11 transition-colors",
                      active
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-muted-foreground/40",
                    )}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">
            {selected ? STAR_LABELS[selected - 1] : "Tap a star to rate"}
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            rows={4}
            maxLength={2000}
            placeholder="What worked well? What could we improve? (optional)"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Input
            maxLength={120}
            placeholder="Your name (optional)"
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
          />
        </div>

        {submitError && (
          <p className="text-center text-xs text-danger">{submitError}</p>
        )}

        <Button
          type="submit"
          disabled={!selected || submitting}
          className="h-12 w-full rounded-lg text-base"
        >
          {submitting ? "Submitting…" : "Submit rating"}
        </Button>
      </form>
    </Shell>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <main className="dot-grid flex min-h-[100dvh] items-center justify-center px-4 py-10">
    <div className="surface w-full max-w-lg p-8 sm:p-10">{children}</div>
  </main>
);