<!--
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Github Owners Bot

A web service that suggests approvers for a GitHub pull request based on OWNERS
files and enforces reviews by OWNERS as a GitHub status check.

## Deploying

This web server assumes it is running on Google Compute Engine (GCE).
A few Environment Variables need to be setup on the GCE start-up script.
(See gce/startup-script.sh)

- **REPO** The GitHub repository to clone
- **APP_DIR** The directory to deploy the app to
- **REPO_DIR** The directory path on the server to place the git clone
- **GITHUB_BOT_USERNAME** The username of the bot
- **GCLOUD_PROJECT** Google Cloud Project Id.
- **CLOUD_BUCKET**
- **OAUTH2_CLIENT_ID**
- **OAUTH2_CLIENT_SECRET**
- **GITHUB_ACCESS_TOKEN** The Authorization token used to make requests to
  GitHub. This can be generated in your GitHub settings.

#### GITHUB_ACCESS_TOKEN

To Generate a GITHUB_ACCESS_TOKEN see [creating an access token article](https://help.github.com/articles/creating-an-access-token-for-command-line-use/).
Access Token will need `public_repo` and `repo:status` scopes.

#### GitHub Webhook events

- Issue Comment
- Pull Request
- Pull Request Review
- Push

## Disclaimer

This is not an official Google product.
