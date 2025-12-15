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

    before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    root.container.addEventListener('change', () => {
        onAction();
    });

    root.container.addEventListener('reset', () => {
        setTimeout(onAction);
    });

    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
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