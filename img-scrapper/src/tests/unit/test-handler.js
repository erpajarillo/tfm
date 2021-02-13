'use strict'

import {describe, it} from "@jest/globals";

const app = require('../app.ts')
let event, context

describe('Tests index', function () {
  it('verifies successful response', async () => {
    const result = await app.lambdaHandler(event, context)

  })
})
