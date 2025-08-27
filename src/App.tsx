import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as todoService from './api/todos';
import { Todo } from './types/Todo';
import { SORTFIELD } from './types/SortField';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TodoList } from './components/TodoList';
import { ErrorNotification } from './components/ErrorNotification';
import { getVisibleTodos } from './helpers/helper';
import { Processing } from './types/Processing';
import { ErrorTypes } from './types/ErrorType';

export const App: React.FC = () => {
  const [sortField, setSortField] = useState<SORTFIELD>(SORTFIELD.ALL);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [editingMode, setEditingMode] = useState<number | null>(null);

  const [isProcessing, setIsProcessing] = useState<Processing>({
    editing: [],
    submitting: null,
    deleting: [],
  });

  useEffect(() => {
    todoService
      .getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage(ErrorTypes.getError);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      });
  }, []);

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  const deleteTodo = (todoId: number) => {
    setErrorMessage('');

    return todoService
      .deleteTodo(todoId)
      .then(() => {
        setErrorMessage('');
        setTodos(currentTodos =>
          currentTodos.filter(currentTodo => currentTodo.id !== todoId),
        );
      })
      .catch(error => {
        setTodos(todos);
        setErrorMessage(ErrorTypes.deleteError);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);

        throw error;
      });
  };

  const createTodo = (todo: Todo) => {
    setErrorMessage('');

    const temporaryTodo: Todo = {
      id: 0,
      userId: todoService.USER_ID,
      title,
      completed: false,
    };

    setTempTodo(temporaryTodo);

    return todoService
      .createTodo(todo)
      .then(newTodo => {
        setErrorMessage('');
        setTodos(currentTodos => [...currentTodos, newTodo]);
        setTempTodo(null);
      })
      .catch(error => {
        setTempTodo(null);
        setErrorMessage(ErrorTypes.postError);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);

        throw error;
      });
  };

  const updateTodo = (todo: Todo) => {
    setErrorMessage('');

    return todoService
      .updateTodo(todo)
      .then(updatedTodo => {
        setErrorMessage('');
        setTodos(currentTodos => {
          const updatedTodos = [...currentTodos];
          const index = updatedTodos.findIndex(t => t.id === todo.id);

          updatedTodos.splice(index, 1, updatedTodo);

          return updatedTodos;
        });
      })
      .catch(err => {
        setErrorMessage(ErrorTypes.patchError);
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        throw err;
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          onSubmit={createTodo}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          title={title}
          setTitle={setTitle}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          editingMode={editingMode}
          onUpdate={updateTodo}
        />

        <TodoList
          todos={getVisibleTodos(todos, sortField)}
          onDelete={deleteTodo}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          onUpdate={updateTodo}
          editingMode={editingMode}
          setEditingMode={setEditingMode}
        />

        {tempTodo && (
          <TodoList
            todos={[tempTodo]}
            onDelete={() => Promise.resolve()}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            onUpdate={updateTodo}
            editingMode={editingMode}
            setEditingMode={setEditingMode}
          />
        )}

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <Footer
            todos={todos}
            sortField={sortField}
            setSortField={setSortField}
            onDelete={deleteTodo}
            setIsProcessing={setIsProcessing}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorNotification
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
