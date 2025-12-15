import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
    // Выводим шаблоны "до" таблицы в обратном порядке с использованием prepend
    before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    // Выводим шаблоны "после" таблицы с использованием append
    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    // @todo: #1.3 —  обработать события и вызвать onAction()
    // Обработчик события change - просто вызываем onAction без аргументов
    root.container.addEventListener('change', () => {
        onAction();
    });

    // Обработчик события reset - используем setTimeout для отложенного вызова
    // так как reset срабатывает быстрее, чем поля успевают очиститься
    root.container.addEventListener('reset', () => {
        setTimeout(onAction);
    });

    // Обработчик события submit - предотвращаем стандартное поведение и передаем submitter
    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        const nextRows = data.map(item => {
            // Клонируем шаблон строки
            const row = cloneTemplate(rowTemplate);

            // Перебираем ключи данных и заполняем соответствующие элементы
            Object.keys(item).forEach(key => {
                // Проверяем, существует ли элемент с таким именем в шаблоне
                if (key in row.elements) {
                    const element = row.elements[key];

                    // Проверяем тип элемента и присваиваем значение соответствующим образом
                    if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                        element.value = item[key];
                    } else {
                        element.textContent = item[key];
                    }
                }
            });

            // Возвращаем контейнер строки для вставки в таблицу
            return row.container;
        });

        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}