import {makeIndex} from "./lib/utils.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    // переменные для кеширования данных
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    const normalizePeopleIndex = (data) => {
        if (Array.isArray(data)) {
            return makeIndex(data, 'id', v => `${v.first_name} ${v.last_name}`);
        }

        if (data && typeof data === 'object') {
            const values = Object.values(data);
            const sample = values[0];

            if (sample && typeof sample === 'object' && 'first_name' in sample && 'last_name' in sample) {
                return Object.fromEntries(values.map(v => [v.id, `${v.first_name} ${v.last_name}`]));
            }

            return data;
        }

        return {};
    }

    // функция для приведения строк в тот вид, который нужен нашей таблице
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    // функция получения индексов
    const getIndexes = async () => {
        if (!sellers || !customers) { // если индексы ещё не установлены, то делаем запросы
            [sellers, customers] = await Promise.all([ // запрашиваем и деструктурируем в уже объявленные ранее переменные
                fetch(`${BASE_URL}/sellers`).then(res => res.json()), // запрашиваем продавцов
                fetch(`${BASE_URL}/customers`).then(res => res.json()), // запрашиваем покупателей
            ]);

            sellers = normalizePeopleIndex(sellers);
            customers = normalizePeopleIndex(customers);
        }

        return { sellers, customers };
    }

    // функция получения записей о продажах с сервера
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query); // преобразуем объект параметров в SearchParams объект, представляющий query часть url
        const nextQuery = qs.toString(); // и приводим к строковому виду

        if (lastQuery === nextQuery && !isUpdated) { // isUpdated параметр нужен, чтобы иметь возможность делать запрос без кеша
            return lastResult; // если параметры запроса не поменялись, то отдаём сохранённые ранее данные
        }

        // если прошлый квери не был ранее установлен или поменялись параметры, то запрашиваем данные с сервера
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery; // сохраняем для следующих запросов
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}