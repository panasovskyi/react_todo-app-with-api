import cn from 'classnames';
import { Todo } from '../types/Todo';
import * as todoService from '../api/todos';
import { useEffect, useRef } from 'react';
import { Processing } from '../types/Processing';
import { ErrorTypes } from '../types/ErrorType';

type Props = {
  todos: Todo[];
  onSubmit: (value: Todo) => Promise<void>;
  errorMessage: string;
  setErrorMessage: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  isProcessing: Processing;
  setIsProcessing: React.Dispatch<React.SetStateAction<Processing>>;
  editingMode: number | null;
  onUpdate: (value: Todo) => Promise<void>;
};

export const Header: React.FC<Props> = ({
  todos,
  onSubmit,
  errorMessage,
  setErrorMessage,
  title,
  setTitle,
  isProcessing,
  setIsProcessing,
  editingMode,
  onUpdate,
}) => {
  const allTodosAreDone = todos.every(t => t.completed);
  const activeTodos = todos.filter(t => !t.completed);
  const titleField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleField.current && !editingMode) {
      titleField.current.focus();
    }
  }, [todos, errorMessage]);

  const onSubmitHandle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (title.trim().length === 0) {
      setErrorMessage(ErrorTypes.titleError);
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      return;
    }

    setIsProcessing(prev => ({ ...prev, submitting: 0 }));

    onSubmit({
      id: 0,
      userId: todoService.USER_ID,
      title: title.trim(),
      completed: false,
    })
      .then(() => setTitle(''))
      .finally(() => setIsProcessing(prev => ({ ...prev, submitting: null })));
  };

  const toggleAllHandle = () => {
    if (allTodosAreDone) {
      todos.forEach(todo => {
        setIsProcessing(prev => ({
          ...prev,
          editing: [...prev.editing, todo.id],
        }));

        onUpdate({
          id: todo.id,
          title: todo.title,
          userId: todo.userId,
          completed: false,
        })
          .then(() =>
            setIsProcessing(prev => ({
              ...prev,
              editing: [],
            })),
          )
          .catch(() => null)
          .finally(() =>
            setIsProcessing(prev => ({
              ...prev,
              editing: [],
            })),
          );
      });
    } else if (activeTodos.length > 0) {
      activeTodos.forEach(todo => {
        setIsProcessing(prev => ({
          ...prev,
          editing: [...prev.editing, todo.id],
        }));

        onUpdate({
          id: todo.id,
          title: todo.title,
          userId: todo.userId,
          completed: true,
        })
          .then(() =>
            setIsProcessing(prev => ({
              ...prev,
              editing: [],
            })),
          )
          .catch(() => null)
          .finally(() =>
            setIsProcessing(prev => ({
              ...prev,
              editing: [],
            })),
          );
      });
    }
  };

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      {todos.length > 0 && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: allTodosAreDone && todos.length > 0,
            hidden: todos.length === 0,
          })}
          data-cy="ToggleAllButton"
          onClick={toggleAllHandle}
        />
      )}

      {/* Add a todo on form submit */}
      <form onSubmit={onSubmitHandle}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isProcessing.submitting === 0}
          ref={titleField}
        />
      </form>
    </header>
  );
};
