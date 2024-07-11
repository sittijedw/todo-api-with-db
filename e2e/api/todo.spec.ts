import { test, expect } from '@playwright/test'

test.describe('Get todos', () => {
  test('should response all todos when request /api/v1/todos', async ({
    request,
  }) => {
    const postResponse1 = await request.post('http://localhost:8910/api/v1/todos',
      {
        data: {
          title: 'Learn Go',
          status: 'active'
        }
      }
    )
    const postResponse2 = await request.post('http://localhost:8910/api/v1/todos',
      {
        data: {
          title: 'Learn Java',
          status: 'inactive'
        }
      }
    )
    const reps = await request.get('http://localhost:8910/api/v1/todos')

    expect(reps.ok()).toBeTruthy()
    expect(await reps.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Learn Go',
          status: 'active'
        },
        {
          id: expect.any(Number),
          title: 'Learn Java',
          status: 'inactive'
        }
      ]
      )
    )

    const postResponseJson1 = await postResponse1.json()
    const postResponseJson2 = await postResponse2.json()
    const postResponseID1 = postResponseJson1['id']
    const postResponseID2 = postResponseJson2['id']

    await request.delete('http://localhost:8910/api/v1/todos/' + String(postResponseID1))
    await request.delete('http://localhost:8910/api/v1/todos/' + String(postResponseID2))
  })
})


test.describe('Get todo by ID', () => {
  test('should response todo when request /api/v1/todos/:id', async ({
    request,
  }) => {
    const postResponse = await request.post('http://localhost:8910/api/v1/todos',
      {
        data: {
          title: 'Learn Go',
          status: 'active'
        }
      }
    )
    const postResponseJson = await postResponse.json()
    const postResponseID = postResponseJson['id']

    const reps = await request.get('http://localhost:8910/api/v1/todos/' + String(postResponseID))

    expect(reps.ok()).toBeTruthy()
    expect(await reps.json()).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: 'Learn Go',
        status: 'active'
      })
    )

    await request.delete('http://localhost:8910/api/v1/todos/' + String(postResponseID))
  })
})