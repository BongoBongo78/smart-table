import {rules, createComparison} from "../lib/compare.js";


export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    // Используем только skipEmptyTargetValues из стандартных правил
    // и добавляем кастомное правило searchMultipleFields для поиска по нескольким полям
    const compare = createComparison(
        ['skipEmptyTargetValues'],  // Стандартное правило для пропуска пустых значений
        [rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)]  // Поиск по полям date, customer, seller без учета регистра
    );

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        return data.filter(row => compare(row, state));
    }
}