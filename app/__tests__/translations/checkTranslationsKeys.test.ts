import * as fs from 'fs';
import { glob } from 'glob';
import * as path from 'path';
import { debug } from '../../../popsize-widget/src/shared/utils/logger';

describe('Translation keys consistency', () => {
  const translationsDir = path.resolve(__dirname, '../../translations');
  const files = fs.readdirSync(translationsDir).filter((f) => f.endsWith('.json'));

  const translations: Record<string, Record<string, any>> = {};
  files.forEach((file) => {
    const filePath = path.join(translationsDir, file);
    translations[file] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });

  const allKeysFromTranslationFiles = new Set<string>();
  Object.values(translations).forEach((obj) => {
    Object.keys(obj).forEach((key) => allKeysFromTranslationFiles.add(key));
  });

  const extractTranslationKeysFromCode = (): Set<string> => {
    const workspaceRoot = path.resolve(__dirname, '../..');
    const targetFolders = ['app'];
    const foundKeys = new Set<string>();

    targetFolders.forEach((folder) => {
      const folderPath = path.join(workspaceRoot, folder);
      if (!fs.existsSync(folderPath)) return;

      const pattern = path.join(folderPath, '**/*.{ts,tsx,js,jsx}').replace(/\\/g, '/');
      const files = glob.sync(pattern);

      files.forEach((file) => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const patterns = [ /\bt\s*\(\s*['`\"]([a-zA-Z][a-zA-Z0-9_\-:\.]*)['`\"]\s*\)/g ];
          patterns.forEach((pattern) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
              const key = match[1];
              if (key && /^[a-zA-Z][a-zA-Z0-9_\-:\.]*$/.test(key) && key.length > 1) {
                foundKeys.add(key);
              }
            }
          });
        } catch (error) {
          // ignore
        }
      });
    });
    return foundKeys;
  };

  describe('Source code translation keys validation', () => {
    let usedKeysInCode: Set<string>;
    beforeAll(() => {
      usedKeysInCode = extractTranslationKeysFromCode();
    });

    test('All translation keys used in code should exist in all translation files', () => {
      const missingKeysReport: Record<string, string[]> = {};
      usedKeysInCode.forEach((key) => {
        const missingInFiles: string[] = [];
        files.forEach((file) => {
          if (!(key in translations[file])) missingInFiles.push(file);
        });
        if (missingInFiles.length > 0) missingKeysReport[key] = missingInFiles;
      });

      if (Object.keys(missingKeysReport).length > 0) {
        debug && debug('\n🚨 Translation keys missing from translation files:');
      }

      expect(Object.keys(missingKeysReport)).toEqual([]);
    });
  });

  files.forEach((file) => {
    test(`${file} should have all translation keys`, () => {
      const missingKeys = Array.from(allKeysFromTranslationFiles).filter((key) => !(key in translations[file]));
      expect(missingKeys).toEqual([]);
    });
  });
});
