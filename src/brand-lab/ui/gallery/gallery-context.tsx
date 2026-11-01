"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
} from "react";
import type { SpecimenAction, SpecimenState } from "../../application/gallery";
import type { GalleryCopy } from "../../domain/gallery-copy";

export type Announce = (text: string) => void;

interface GalleryContextValue {
  specimens: SpecimenState;
  dispatch: Dispatch<SpecimenAction>;
  copy: GalleryCopy;
  announce: Announce;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

export const GalleryProvider = GalleryContext;

export function useGallery(): GalleryContextValue {
  const value = use(GalleryContext);
  if (!value) throw new Error("useGallery must be used inside GalleryProvider");
  return value;
}

/** The one reservation behind every book and reserve control on the page. */
export function useBooking() {
  const { specimens, dispatch, copy, announce } = useGallery();
  const reserved = specimens.booking === "reserved";

  const reserve = () => {
    if (reserved) {
      announce(copy.booking.alreadyReserved);
      return;
    }
    dispatch({ type: "reserve" });
    announce(copy.booking.reservedStatus);
  };

  return { reserved, reserve };
}

const NOTICE_MS = 4000;

export interface Notice {
  id: number;
  text: string;
}

export function useAnnouncer() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const announce = useCallback<Announce>((text) => {
    setNotice((current) => ({ id: (current?.id ?? 0) + 1, text }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  return { notice, announce };
}
