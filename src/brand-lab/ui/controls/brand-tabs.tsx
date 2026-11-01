"use client";

import { BRAND_IDS, BRANDS, type BrandId } from "../../domain/brands";
import { BRAND_ICONS } from "../brand-icons";
import { useLab } from "../lab-provider";
import { Segmented, type SegmentedOption } from "./segmented";

const BRAND_TABS: ReadonlyArray<SegmentedOption<BrandId>> = BRAND_IDS.map((id) => {
  const Icon = BRAND_ICONS[id];
  return {
    value: id,
    label: BRANDS[id].name.split(" ")[0],
    leading: <Icon aria-hidden size={14} />,
  };
});

/** The shared brand switch: every screen reads and writes the same lab state. */
export function BrandTabs({ name }: Readonly<{ name: string }>) {
  const { state, dispatch } = useLab();
  return (
    <Segmented
      legend="Active brand"
      hideLegend
      name={name}
      value={state.brandId}
      options={BRAND_TABS}
      onChange={(brandId) => dispatch({ type: "selectBrand", brandId })}
    />
  );
}
