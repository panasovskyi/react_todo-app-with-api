import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Processing } from '../types/Processing';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  onDelete: (value: number) => Promise<void>;
  isProcessing: Processing;
  setIsProcessing: React.Dispatch<React.SetStateAction<Processing>>;
  onUpdate: (value: Todo) => Promise<void>;
  editingMode: number | null;
  setEditingMode: (value: number | null) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  onDelete,
  isProcessing,
  setIsProcessing,
  onUpdate,
  editingMode,
  setEditingMode,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      <TransitionGroup>
        {todos.map(todo => (
          <CSSTransition
            key={todo.id}
            timeout={300}
            classNames={todo.id === 0 ? 'temp-item' : 'item'}
          >
            <TodoItem
              todo={todo}
              onDelete={onDelete}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              onUpdate={onUpdate}
              editingMode={editingMode}
              setEditingMode={setEditingMode}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </section>
  );
};
