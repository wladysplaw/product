import type { LocalAssetPath } from "./projects";

export type MediaDimensions = {
  width: number;
  height: number;
};

/**
 * Direct-only cases use large source PNGs. These intrinsic dimensions reserve
 * each story's layout before its image is decoded, especially on mobile where
 * the media wrapper intentionally has no fixed aspect ratio.
 */
export const directCaseMediaDimensions: Partial<Record<LocalAssetPath, MediaDimensions>> = {
  "/assets/projects/polee/po_01.png": { width: 2878, height: 1920 },
  "/assets/projects/polee/po_02.png": { width: 2880, height: 1917 },
  "/assets/projects/polee/po_03.png": { width: 2880, height: 1917 },
  "/assets/projects/polee/po_04.png": { width: 2880, height: 1917 },
  "/assets/projects/polee/po_05.png": { width: 2880, height: 1917 },
  "/assets/projects/polee/po_06.png": { width: 2880, height: 1917 },
  "/assets/projects/polee/po_07.png": { width: 2880, height: 1917 },
  "/assets/projects/polee/po_08.png": { width: 2880, height: 1917 },
  "/assets/projects/polee/po_09.png": { width: 2880, height: 1917 },
  "/assets/projects/polee/po_10.png": { width: 2880, height: 1800 },
  "/assets/projects/polee/po_11.png": { width: 2880, height: 1796 },
  "/assets/projects/polee/po_12.png": { width: 2880, height: 1796 },
  "/assets/projects/greeno/gr_01.png": { width: 2888, height: 1780 },
  "/assets/projects/greeno/gr_02.png": { width: 2880, height: 1742 },
  "/assets/projects/greeno/gr_03.png": { width: 2880, height: 1742 },
  "/assets/projects/greeno/gr_04.png": { width: 2888, height: 1780 },
  "/assets/projects/greeno/gr_05.png": { width: 2880, height: 1780 },
  "/assets/projects/motif-network/mn_01.png": { width: 2880, height: 1920 },
  "/assets/projects/motif-network/mn_02.png": { width: 2880, height: 1920 },
  "/assets/projects/motif-network/mn_03.png": { width: 2880, height: 1920 },
  "/assets/projects/motif-network/mn_04.png": { width: 2880, height: 1920 },
  "/assets/projects/cdms/um_01.png": { width: 2880, height: 1920 },
  "/assets/projects/cdms/um_02.png": { width: 2880, height: 1920 },
  "/assets/projects/cdms/um_03.png": { width: 2880, height: 1920 },
  "/assets/projects/knowfid/kn_01.png": { width: 2880, height: 1800 },
  "/assets/projects/knowfid/kn_02.png": { width: 2880, height: 1800 },
  "/assets/projects/knowfid/kn_03.png": { width: 2880, height: 1800 },
  "/assets/projects/knowfid/kn_04.png": { width: 2880, height: 1800 },
  "/assets/projects/fetch-fab/fm_01.png": { width: 2880, height: 1800 },
  "/assets/projects/fetch-fab/fm_02.png": { width: 2880, height: 1800 },
  "/assets/projects/fetch-fab/fm_03.png": { width: 2880, height: 1800 },
  "/assets/projects/fetch-fab/fm_04.png": { width: 2880, height: 1800 }
};
