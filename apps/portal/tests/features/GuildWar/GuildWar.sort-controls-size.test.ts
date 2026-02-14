import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const guildWarPath = path.resolve(__dirname, '../../../src/features/GuildWar/index.tsx');

describe('GuildWar sort controls sizing', () => {
  it('uses readable size tokens for pool/team sort controls', () => {
    const source = fs.readFileSync(guildWarPath, 'utf8');

    expect(source).not.toContain("fontSize: '0.5rem'");
    expect(source).not.toContain('sx={{ height: 28 }}');
  });
});
