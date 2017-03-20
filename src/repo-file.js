/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* @flow */
import {Owner} from './owner';
import * as path from 'path';

/**
 * Represents the File that has been changed from the repository.
 * This is hydrated from the github pull request api.
 */
export class RepoFile {

  path: string;
  dirname: string;
  ownersMap: OwnersMap;
  dirOwner: Owner;

  constructor(filePath: string, ownersMap: OwnersMap) {
    // We want it have the leading ./ to evaluate `.` later on
    this.path = /^\./.test(filePath) ? filePath : `.${path.sep}${filePath}`;
    this.dirname = path.dirname(this.path);
    this.ownersMap = ownersMap;

    this.dirOwner = this.findOwnerFile_();
  }

  findOwnerFile_(): Owner {
    let dirname = this.dirname;
    let owner = this.ownersMap[dirname];
    const dirs = dirname.split(path.sep);

    while (!owner && dirs.pop() && dirs.length) {
      dirname = dirs.join(path.sep);
      owner = this.ownersMap[dirname];
    }
    return owner;
  }

  findRepoFileOwner(): RepoFileOwner {
    return {
      id: this.dirOwner.path,
      type: 'dir',
      usernames: this.dirOwner.dirOwners,
    };
  }
}
