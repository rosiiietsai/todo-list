import icons from '../img/sprite.svg';
import { v4 as uuidv4 } from 'uuid';

const mainContainer = document.querySelector('.container__main');
const formContainer = document.querySelector('.container__form');
const topbarContainer = document.querySelector('.topbar');
const todosContainer = document.querySelector('.todos');

let todos = [];

const swapArrElements = function (array, index1, index2) {
  [array[index1], array[index2]] = [array[index2], array[index1]];
};

const showMsg = function (todos) {
  if (todos.length)
    todosContainer
      .querySelector('.todo__msg')
      .classList.add('hidden__immediate');
  else
    todosContainer
      .querySelector('.todo__msg')
      .classList.remove('hidden__immediate');
};

const toggleAddForm = function () {
  mainContainer.classList.toggle('hidden__immediate');
  formContainer.classList.toggle('hidden__immediate');

  // focus input field
  formContainer.querySelector('#todo').focus();
};

const preFillForm = function (todo) {
  formContainer.querySelector('#id').value = todo.id;
  formContainer.querySelector('#todo').value = todo.todo;
  formContainer.querySelector(`#priority-${todo.priority}`).checked = true;
  formContainer.querySelector('#top').checked = false;
  formContainer
    .querySelector('.btn__checkbox use')
    .setAttribute('href', `${icons}#icon-square-o`);
};

const initForm = function () {
  const init = {
    id: '',
    todo: '',
    priority: 'medium',
    isTop: false,
    isCompleted: false,
  };

  preFillForm(init);
};

const toggleCheckbox = function (e) {
  const checkbox = e.target.closest('.btn__checkbox');
  if (!checkbox) return;

  let isChecked = formContainer.querySelector('#top').checked;
  isChecked = !isChecked;
  checkbox
    .querySelector('use')
    .setAttribute(
      'href',
      `${icons}#${isChecked ? 'icon-check-square' : 'icon-square-o'}`
    );
};

const showCategory = function (e) {
  const btn = e.target.closest('.topbar__category');
  const categoryDisplays = todosContainer.querySelectorAll('.todo__category');
  const category = e.target.closest('.topbar__category').dataset.category;

  // update topbar status
  [...btn.parentElement.children].forEach(btn =>
    btn.classList.remove('topbar__category--active')
  );
  btn.classList.add('topbar__category--active');

  // show todos and delete all btn for ALL
  categoryDisplays.forEach(c => c.classList.remove('hidden__immediate'));
  todosContainer
    .querySelector('.btn__large')
    .classList.remove('hidden__immediate');

  if (category !== 'all') {
    // show todos for OTHER category
    categoryDisplays.forEach(c => c.classList.add('hidden__immediate'));
    todosContainer
      .querySelector(`.todo__category--priority-${category}`)
      .classList.remove('hidden__immediate');

    // hide delete all btn
    todosContainer
      .querySelector('.btn__large')
      .classList.add('hidden__immediate');
  }
};

const completeTodo = function (e, todo) {
  const click = e.target;
  if (!click.closest('.checkbox')) return;

  // update stored todo
  todo.isCompleted = !todo.isCompleted;

  location.reload();
};

const editTodo = function (e, todo) {
  const btn = e.target.closest('.todo__btn--edit');
  if (!btn) return;

  toggleAddForm();
  preFillForm(todo);
  // update todo display by submitting the form
};

const moveTodo = function (e, id) {
  const btnUp = e.target.closest('.todo__btn--up');
  const btnDown = e.target.closest('.todo__btn--down');
  const todoEl = e.target.closest('.todo');
  const todoElCopy = todoEl.cloneNode(true);
  const preEl = todoEl.previousElementSibling;
  const nextEl = todoEl.nextElementSibling;
  const index = todos.findIndex(t => t.id === id);

  if (btnUp && preEl) {
    // update display
    preEl.before(todoElCopy);
    todoEl.remove();

    // update todos by swap the element
    swapArrElements(todos, index - 1, index);
  }

  if (btnDown && nextEl) {
    // update display
    nextEl.after(todoElCopy);
    todoEl.remove();

    // update todos by swap the element
    swapArrElements(todos, index, index + 1);
  }
};

const deleteTodo = function (e, id) {
  const btn = e.target.closest('.todo__btn--remove');
  if (!btn) return;

  // delete from stored todo
  const index = todos.findIndex(t => t.id === id);
  todos.splice(index, 1);

  // delete todo from display
  const todoEl = e.target.closest('.todo');
  todoEl.remove();
};

const deleteCompletedTodos = function () {
  // delete from stored todos
  todos = todos.filter(t => !t.isCompleted);

  // delete todos from display
  const todoEls = document.querySelectorAll('.todo__category--completed');
  todoEls.forEach(t => t.remove());
};

const generateTodoMarkup = function (todo) {
  return `
    <div class="todo todo__tag--priority-${todo.priority} ${
    todo.isCompleted ? 'todo__tag--completed' : ''
  }" data-id="${todo.id}">
        <div class="btn btn__icon checkbox">
            <svg class="checkbox__icon">
                <use href="${icons}#${
    todo.isCompleted ? 'icon-check-square' : 'icon-square-o'
  }"></use>
            </svg>
        </div>
        <p class="todo__content">${todo.todo}</p>
        <button class="btn todo__btn todo__btn--edit btn__icon">
            <svg>
                <use href="${icons}#icon-edit"></use>
            </svg>
        </button>
        <button class="btn todo__btn todo__btn--remove btn__icon">
            <svg>
                <use href="${icons}#icon-trash-o"></use>
            </svg>
        </button>
        <button class="btn todo__btn todo__btn--up btn__icon">
            <svg>
                <use href="${icons}#icon-arrow-up-thick"></use>
            </svg>
        </button>
        <button class="btn todo__btn todo__btn--down btn__icon">
            <svg>
                <use href="${icons}#icon-arrow-down-thick"></use>
            </svg>
        </button>
    </div>
  `;
};

const updateTodoDisplay = function (todo) {
  // delete original todo element
  todosContainer.querySelector(`.todo[data-id="${todo.id}"]`)?.remove();

  // generate new markup
  const markup = generateTodoMarkup(todo);

  // insert the markup by default
  todosContainer
    .querySelector(
      todo.isCompleted
        ? '.todo__category--completed'
        : `.todo__category--priority-${todo.priority}`
    )
    .insertAdjacentHTML(`${todo.isTop ? 'afterbegin' : 'beforeend'}`, markup);

  // set to default
  todo.isTop = false;
};

//////////////////////////////////////////////
// FORM
formContainer.querySelector('.form').addEventListener('submit', function (e) {
  e.preventDefault();

  // close form
  const btn = e.target.closest('.form__btn--submit');
  const input = formContainer.querySelector('#todo').value;
  if (!btn && !input) return;
  toggleAddForm();

  // store input todo
  const dataEntries = [...new FormData(this)];
  const data = Object.fromEntries(dataEntries);

  // remove existing original todo (for edit)
  if (data.id) {
    const index = todos.findIndex(t => t.id === data.id);
    todos.splice(index, 1);
  }

  // format todo
  const todo = {
    id: data.id ? data.id : uuidv4(),
    todo: data.todo,
    priority: data.priority,
    isTop: data.top === 'on' ? true : false,
    isCompleted: false,
  };

  // store todo and todos
  if (todo.isTop) todos.unshift(todo);
  else todos.push(todo);

  // store todos in local storage
  localStorage.setItem('localTodos', JSON.stringify(todos));

  updateTodoDisplay(todo);
  showMsg(todos);
});

formContainer.addEventListener('click', function (e) {
  // close form without submission
  const btn = e.target.closest('.form__btn--close');
  if (btn) toggleAddForm();
  toggleCheckbox(e);
});

//////////////////////////////////////////////
// TOPBAR
topbarContainer.addEventListener('click', function (e) {
  // show selected category
  if (e.target.closest('.topbar__category')) {
    showCategory(e);
  }

  // open new form
  if (e.target.closest('.topbar__btn--add')) {
    toggleAddForm();
    initForm();
  }
});

//////////////////////////////////////////////
// TODO DISPLAY
todosContainer.addEventListener('click', function (e) {
  // for single todo
  if (e.target.closest('.todo')) {
    const id = e.target.closest('.todo').dataset.id;
    const todo = todos.find(t => t.id === id);

    completeTodo(e, todo);
    editTodo(e, todo);
    moveTodo(e, id);
    deleteTodo(e, id);
  }

  // for all todos
  if (e.target.closest('.btn__large')) {
    deleteCompletedTodos();
  }

  // store todos in local storage
  localStorage.setItem('localTodos', JSON.stringify(todos));

  showMsg(todos);
});

//////////////////////////////////////////////
// display persisted todos
const displayPersistedTodos = function () {
  const storage = localStorage.getItem('localTodos');
  if (!storage) return;

  todos = JSON.parse(storage);
  todos.forEach(t => updateTodoDisplay(t));

  showMsg(todos);
};
displayPersistedTodos();
