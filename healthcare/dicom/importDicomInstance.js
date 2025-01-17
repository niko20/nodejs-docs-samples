/**
 * Copyright 2019, Google, LLC
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-warning-comments */

'use strict';

function main(
  projectId = process.env.GCLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  dicomStoreId,
  gcsUri
) {
  // [START healthcare_import_dicom_instances]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1beta1');
  const sleep = require('../sleep');

  async function importDicomInstance() {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({auth});

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const dicomStoreId = 'my-dicom-store';
    // const gcsUri = 'my-bucket/my-directory/*.dcm'
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
    const request = {
      name,
      resource: {
        // The location of the DICOM instances in Cloud Storage
        gcsSource: {
          uri: `gs://${gcsUri}`,
        },
      },
    };

    const operation = await healthcare.projects.locations.datasets.dicomStores.import(
      request
    );
    const operationName = operation.data.name;

    const operationRequest = {name: operationName};

    // Wait fifteen seconds for the LRO to finish.
    await sleep(15000);

    // Check the LRO's status
    const operationStatus = await healthcare.projects.locations.datasets.operations.get(
      operationRequest
    );

    const {data} = operationStatus;

    if (data.error === undefined) {
      console.log('Successfully imported DICOM instances');
    } else {
      console.log('Encountered errors. Sample error:');
      console.log(
        'Resource on which error occured:',
        data.error.details[0]['sampleErrors'][0]['resource']
      );
      console.log(
        'Error code:',
        data.error.details[0]['sampleErrors'][0]['error']['code']
      );
      console.log(
        'Error message:',
        data.error.details[0]['sampleErrors'][0]['error']['message']
      );
    }
  }

  importDicomInstance();
  // [END healthcare_import_dicom_instances]
}

// node importDicomInstance.js <projectId> <cloudRegion> <datasetId> <dicomStoreId> <gcsUri>
main(...process.argv.slice(2));
