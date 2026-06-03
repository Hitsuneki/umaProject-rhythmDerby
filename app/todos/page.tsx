import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul className="p-8 space-y-2 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Supabase Todos Test Page</h1>
      {todos && todos.length > 0 ? (
        todos.map((todo) => (
          <li key={todo.id} className="border-b border-gray-100 py-1">
            {todo.name}
          </li>
        ))
      ) : (
        <p className="text-gray-500">No todos found or database table is empty.</p>
      )}
    </ul>
  )
}
