/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import cn from 'classnames';
import { Todo } from '../types/Todo';
import { Processing } from '../types/Processing';
import { useEffect, useRef, useState } from 'react';

type Props = {
  todo: Todo;
  onDelete: (value: number) => Promise<void>;
  isProcessing: Processing;
  setIsProcessing: React.Dispatch<React.SetStateAction<Processing>>;
  onUpdate: (value: Todo) => Promise<void>;
  editingMode: number | null;
  setEditingMode: (value: number | null) => void;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  onDelete,
  isProcessing,
  setIsProcessing,
  onUpdate,
  editingMode,
  setEditingMode,
}) => {
  const [todoBody, setTodoBody] = useState(todo.title);

  const onDeleteHandle = (todoId: number) => {
    setIsProcessing(prev => ({ ...prev, deleting: [todo.id] }));
    onDelete(todoId).finally(() =>
      setIsProcessing(prev => ({ ...prev, deleting: [] })),
    );
  };

  const onRenameHandle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setEditingMode(null);

    setIsProcessing(prev => ({ ...prev, editing: [todo.id] }));

    if (todoBody === todo.title) {
      setIsProcessing(prev => ({ ...prev, editing: [] }));
      setEditingMode(null);

      return;
    }

    if (todoBody.length === 0) {
      onDelete(todo.id).catch(() => {
        setEditingMode(todo.id);
        setIsProcessing(prev => ({ ...prev, editing: [] }));
      });

      return;
    }

    onUpdate({
      id: todo.id,
      title: todoBody.trim(),
      userId: todo.userId,
      completed: todo.completed,
    })
      .then(() => setEditingMode(null))
      .catch(() => {
        setEditingMode(todo.id);
      })
      .finally(() => {
        setIsProcessing(prev => ({ ...prev, editing: [] }));
      });
  };

  const onToggleHandle = () => {
    setIsProcessing(prev => ({ ...prev, editing: [todo.id] }));

    onUpdate({
      id: todo.id,
      title: todoBody,
      userId: todo.userId,

      completed: !todo.completed,
    })
      .then(() => {
        setIsProcessing(prev => ({ ...prev, editing: [] }));
      })
      .finally(() => {
        setIsProcessing(prev => ({ ...prev, editing: [] }));
      });
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && editingMode === todo.id) {
      inputRef.current.focus();
    }
  }, [editingMode, todo.id]);

  const onKeyUpHandle = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setTodoBody(todo.title);
      setEditingMode(null);
    }
  };

  return (
    <div
      key={todo.id}
      data-cy="Todo"
      className={cn('todo', { completed: todo.completed })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={onToggleHandle}
        />
      </label>

      {editingMode === todo.id ? (
        <form onSubmit={onRenameHandle} onBlur={onRenameHandle}>
          <input
            ref={inputRef}
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={todoBody}
            onChange={e => setTodoBody(e.target.value)}
            onKeyUp={onKeyUpHandle}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setEditingMode(todo.id)}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => {
              onDeleteHandle(todo.id);
            }}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active':
            isProcessing.deleting.includes(todo.id) ||
            isProcessing.submitting === todo.id ||
            isProcessing.editing.includes(todo.id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
