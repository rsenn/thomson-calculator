'use strict';

import path from 'path';
import { remote } from 'electron';
import { rootPath } from 'electron-root-path';
import getPlatform from './get-platform';

const IS_PROD = process.env.NODE_ENV === 'production';
const root = rootPath;
const { getAppPath } = remote.app;
const isPackaged =
  process.mainModule.filename.indexOf('app.asar') !== -1;

const binariesPath =
  IS_PROD && isPackaged
    ? path.join(path.dirname(getAppPath()), '..', './Resources', './bin')
    : path.join(root, './resources', getPlatform(), './bin');

export const execPath = path.resolve(path.join(binariesPath, './binary-file'));
