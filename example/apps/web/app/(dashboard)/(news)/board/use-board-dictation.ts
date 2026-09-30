"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import {
  applySpeechOptions,
  getSpeechRecognitionCtor,
  mergeSpeechResults,
  transcriptsFromResults,
} from "@/lib/speech/recognition";
import type {
  SpeechRecognitionCtor,
  SpeechRecognitionInstance,
} from "@/lib/speech/recognition";

const restartLimit = 20;
const fatalErrors = new Set([
  "not-allowed",
  "service-not-allowed",
  "audio-capture",
  "network",
]);

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor & { available?: unknown };
  webkitSpeechRecognition?: SpeechRecognitionCtor;
  SpeechRecognitionPhrase?: new (phrase: string, boost: number) => unknown;
};

function ctorFromWindow(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") {
    return;
  }
  const speechWindow = window as SpeechWindow;
  return getSpeechRecognitionCtor({
    recognition: speechWindow.SpeechRecognition,
    webkitRecognition: speechWindow.webkitSpeechRecognition,
  });
}

function availableLabel({
  ctor,
}: {
  ctor: SpeechRecognitionCtor;
}): string | undefined {
  const { available } = ctor as { available?: unknown };
  return typeof available === "string" ? available : undefined;
}

export function useBoardDictation({
  prompt,
  onDraft,
}: {
  prompt: string;
  onDraft: (value: string) => void;
}) {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [listening, setListening] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [interim, setInterim] = useState("");
  const listeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const restartCountRef = useRef(0);
  const prefixRef = useRef("");
  const sessionFinalsRef = useRef("");
  const instanceFinalsBaseRef = useRef("");
  const toastedRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const promptRef = useRef(prompt);
  const onDraftRef = useRef(onDraft);
  const available = hydrated && Boolean(ctorFromWindow());

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);
  useEffect(() => {
    onDraftRef.current = onDraft;
  }, [onDraft]);

  function fail({ message }: { message: string }) {
    stopRequestedRef.current = true;
    listeningRef.current = false;
    setListening(false);
    setDisabled(true);
    recognitionRef.current?.stop();
    if (toastedRef.current) {
      return;
    }
    toastedRef.current = true;
    toast.error(message);
  }

  function publish({
    sessionFinals,
    nextInterim,
  }: {
    sessionFinals: string;
    nextInterim: string;
  }) {
    sessionFinalsRef.current = sessionFinals;
    setInterim(nextInterim);
    onDraftRef.current(
      mergeSpeechResults({
        interim: nextInterim,
        sessionFinals,
        typed: prefixRef.current,
      })
    );
  }

  function attach({
    recognition,
    ctor,
  }: {
    recognition: SpeechRecognitionInstance;
    ctor: SpeechRecognitionCtor;
  }) {
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    applySpeechOptions({
      available: availableLabel({ ctor }),
      phraseCtor: (window as SpeechWindow).SpeechRecognitionPhrase,
      recognition,
    });
    recognition.onresult = (event) => {
      restartCountRef.current = 0;
      const spoken = transcriptsFromResults({ results: event.results });
      publish({
        nextInterim: spoken.interim,
        sessionFinals: `${instanceFinalsBaseRef.current}${spoken.instanceFinals}`,
      });
    };
    recognition.onerror = (event) => {
      if (!fatalErrors.has(event.error)) {
        return;
      }
      fail({ message: "Microphone is not available" });
    };
    recognition.onend = () => {
      if (stopRequestedRef.current || !listeningRef.current) {
        listeningRef.current = false;
        setListening(false);
        return;
      }
      if (restartCountRef.current >= restartLimit) {
        fail({ message: "Microphone stopped" });
        return;
      }
      restartCountRef.current += 1;
      instanceFinalsBaseRef.current = sessionFinalsRef.current;
      try {
        recognition.start();
      } catch {
        fail({ message: "Microphone stopped" });
      }
    };
  }

  function stopSession() {
    stopRequestedRef.current = true;
    listeningRef.current = false;
    setListening(false);
    setInterim("");
    recognitionRef.current?.stop();
  }

  function startSession() {
    const ctor = ctorFromWindow();
    if (!ctor || disabled) {
      return;
    }
    stopRequestedRef.current = false;
    restartCountRef.current = 0;
    prefixRef.current = promptRef.current;
    sessionFinalsRef.current = "";
    instanceFinalsBaseRef.current = "";
    setInterim("");
    const recognition = new ctor();
    recognitionRef.current = recognition;
    attach({ ctor, recognition });
    listeningRef.current = true;
    setListening(true);
    try {
      recognition.start();
    } catch {
      fail({ message: "Microphone is not available" });
    }
  }

  function toggle() {
    if (listeningRef.current) {
      stopSession();
      return;
    }
    startSession();
  }

  useEffect(() => {
    if (!listening) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      event.preventDefault();
      stopSession();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [listening]);

  useEffect(
    () => () => {
      stopRequestedRef.current = true;
      recognitionRef.current?.stop();
    },
    []
  );

  return {
    blocked: disabled,
    interim,
    listening,
    supported: available,
    toggle,
  };
}
