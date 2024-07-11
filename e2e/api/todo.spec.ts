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
    const resp = await request.get('http://localhost:8910/api/v1/todos')

    expect(resp.ok()).toBeTruthy()
    expect(await resp.json()).toEqual(
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

    const newTodo1 = await postResponse1.json()
    const newTodo2 = await postResponse2.json()
    const newTodoID1 = newTodo1['id']
    const newTodoID2 = newTodo2['id']

    await request.delete('http://localhost:8910/api/v1/todos/' + String(newTodoID1))
    await request.delete('http://localhost:8910/api/v1/todos/' + String(newTodoID2))
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
    const newTodo = await postResponse.json()
    const newTodoID = newTodo['id']

    const resp = await request.get('http://localhost:8910/api/v1/todos/' + String(newTodoID))

    expect(resp.ok()).toBeTruthy()
    expect(await resp.json()).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: 'Learn Go',
        status: 'active'
      })
    )

    await request.delete('http://localhost:8910/api/v1/todos/' + String(newTodoID))
  })
})

test.describe('Post new todo', () => {
  test('should response new todo when request /api/v1/todos', async ({
    request,
  }) => {
    const getRespBefore = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespBefore.ok()).toBeTruthy()
    expect(await getRespBefore.json()).toEqual(
      expect.arrayContaining([])
    )

    const resp = await request.post('http://localhost:8910/api/v1/todos',
      {
        data: {
          title: 'Learn Go',
          status: 'active'
        }
      }
    )

    const newTodo = await resp.json()
    const newTodoID = newTodo['id']

    expect(resp.ok()).toBeTruthy()
    expect(newTodo).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: 'Learn Go',
        status: 'active'
      })
    )

    const getRespAfter = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespAfter.ok()).toBeTruthy()
    expect(await getRespAfter.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Learn Go',
          status: 'active'
        }
      ])
    )

    await request.delete('http://localhost:8910/api/v1/todos/' + String(newTodoID))
  })
})