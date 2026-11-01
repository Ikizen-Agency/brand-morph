"use client";

import { createContext, use, type Dispatch } from "react";
import type { SpecimenAction, SpecimenState } from "../../application/gallery";
import type { GalleryCopy } from "../../domain/gallery-copy";
import type { Announce } from "../use-announcer";

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
