export interface PatchNoteItem {
  type: 'feature' | 'fix' | 'improvement';
  description: string;
}

export interface PatchNoteRelease {
  version: string;
  releaseDate: string;
  isLatest?: boolean;
  highlights: string;
  changes: PatchNoteItem[];
}

export const PATCH_NOTES: PatchNoteRelease[] = [
  {
    version: 'v1.2.0',
    releaseDate: '2026-10-04',
    isLatest: true,
    highlights: 'Added live production Patch Notes and historical changes drawer.',
    changes: [
      {
        type: 'feature',
        description:
          "New What's New / Patch Notes drawer accessible directly from the application header.",
      },
      {
        type: 'improvement',
        description: 'Enhanced header layout with direct version indicators.',
      },
      {
        type: 'fix',
        description: 'Preserved clean worktree and test execution pipelines.',
      },
    ],
  },
  {
    version: 'v1.1.0',
    releaseDate: '2026-10-03',
    highlights: 'Smooth car positions and 60fps track replay interpolation.',
    changes: [
      {
        type: 'feature',
        description: 'Full 60fps track replay simulation and telemetry interpolation.',
      },
      {
        type: 'improvement',
        description:
          'Optimized car coordinate transforms on high-resolution SVG track silhouettes.',
      },
    ],
  },
  {
    version: 'v1.0.0',
    releaseDate: '2026-09-28',
    highlights: 'Initial production release of F1 Frontend.',
    changes: [
      {
        type: 'feature',
        description:
          'Interactive F1 telemetry comparisons, meeting selectors, and live session leaderboards.',
      },
      {
        type: 'feature',
        description: 'Dark / Light theme support and automated live deployment indicators.',
      },
    ],
  },
];
