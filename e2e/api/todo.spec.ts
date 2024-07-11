import { test, expect } from '@playwright/test'

test.describe('Get todos', () => {
  test('should response HTTP status success and get all todos when request GET /api/v1/todos', async ({
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
  test('should response HTTP status success and get todo when request GET /api/v1/todos/:id', async ({
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
  test('should response HTTP status success and get new todo when request POST /api/v1/todos', async ({
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

test.describe('Delete todo by id', () => {
  test('should response HTTP status success and get Success message when request DELETE /api/v1/todos/:id', async ({
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

    const getRespBefore = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespBefore.ok()).toBeTruthy()
    expect(await getRespBefore.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Learn Go',
          status: 'active'
        }
      ])
    )

    const resp = await request.delete('http://localhost:8910/api/v1/todos/' + String(newTodoID))
    expect(resp.ok()).toBeTruthy()
    expect(await resp.json()).toEqual(
      expect.stringContaining("Success")
    )

    const getRespAfter = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespAfter.ok()).toBeTruthy()
    expect(await getRespAfter.json()).toEqual(
      expect.arrayContaining([])
    )
  })
})

test.describe('Put todo by id', () => {
  test('should response HTTP status success and Update title to Workout and status to inactive when request PUT /api/v1/todos/:id', async ({
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

    const getRespBefore = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespBefore.ok()).toBeTruthy()
    expect(await getRespBefore.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Learn Go',
          status: 'active'
        }
      ])
    )

    const resp = await request.put('http://localhost:8910/api/v1/todos/' + String(newTodoID),
      {
        data: {
          title: 'Workout',
          status: 'inactive'
        }
      }
    )
    expect(resp.ok()).toBeTruthy()
    expect(await resp.json()).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: 'Workout',
        status: 'inactive'
      })
    )

    const getRespAfter = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespAfter.ok()).toBeTruthy()
    expect(await getRespAfter.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Workout',
          status: 'inactive'
        }
      ])
    )

    await request.delete('http://localhost:8910/api/v1/todos/' + String(newTodoID))
  })
})

test.describe('Patch todo title by id', () => {
  test('should response HTTP status success and Update title to Cleaning when request PATCH /api/v1/todos/:id/actions/title', async ({
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

    const getRespBefore = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespBefore.ok()).toBeTruthy()
    expect(await getRespBefore.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Learn Go',
          status: 'active'
        }
      ])
    )

    const resp = await request.patch('http://localhost:8910/api/v1/todos/' + String(newTodoID) + '/actions/title',
      {
        data: {
          title: 'Cleaning',
        }
      }
    )
    expect(resp.ok()).toBeTruthy()

    const getRespAfter = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespAfter.ok()).toBeTruthy()
    expect(await getRespAfter.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Cleaning',
          status: 'active'
        }
      ])
    )

    await request.delete('http://localhost:8910/api/v1/todos/' + String(newTodoID))
  })
})

test.describe('Patch todo status by id', () => {
  test('should response HTTP status success and Update status to inactive when request PATCH /api/v1/todos/:id/actions/status', async ({
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

    const getRespBefore = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespBefore.ok()).toBeTruthy()
    expect(await getRespBefore.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Learn Go',
          status: 'active'
        }
      ])
    )

    const resp = await request.patch('http://localhost:8910/api/v1/todos/' + String(newTodoID) + '/actions/status',
      {
        data: {
          status: 'inactive',
        }
      }
    )
    expect(resp.ok()).toBeTruthy()

    const getRespAfter = await request.get('http://localhost:8910/api/v1/todos')

    expect(getRespAfter.ok()).toBeTruthy()
    expect(await getRespAfter.json()).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          title: 'Learn Go',
          status: 'inactive'
        }
      ])
    )

    await request.delete('http://localhost:8910/api/v1/todos/' + String(newTodoID))
  })
})