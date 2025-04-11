import './style.scss'

// MOCK
let users = [
    {
        id: '1',
        avatar: './img/avatars/1.jpg',
        firstname: 'Ольга',
        lastname: 'Токсикова',
        city: 'Днепропетровск'
    },
    {
        id: '2',
        avatar: './img/avatars/2.jpg',
        firstname: 'Айбелив',
        lastname: 'Айкенфлаева',
        city: 'Москва'
    },
]
let messages = [
    {
        id: '1',
        userId: '1',
        time: 'вчера в 17.45',
        message: 'Где взять на прокат вечернее красивое платье? А еще лучше дизайнерское! Предстоит участие в <a href="#">мероприятии</a>, где все гости будут наверняка одеты в наряды "от кутюр", а у меня со средствами туговато, да и жалко на один раз такие деньжищи отваливать. Мне бы салон найти, где на прокат можно такой наряд взять. Поделитесь, пожалуйста, советами.'
    },
    {
        id: '2',
        userId: '2',
        time: 'вчера в 18.45',
        message: 'Поисковик вам в помощь! Но цена примерно в половину стоимости платья.'
    },
    {
        id: '3',
        userId: '1',
        time: 'сегодня в 17.45',
        message: 'Где взять на прокат вечернее красивое платье? А еще лучше дизайнерское! Предстоит участие в мероприятии, где все гости будут наверняка одеты в наряды "от кутюр", а у меня со средствами туговато'
    },
    {
        id: '4',
        userId: '2',
        time: 'сегодня в 18.45',
        message: 'Поисковик вам в помощь! Но цена примерно в половину стоимости платья.'
    },
]
let rating = 3;
const CURRENT_USER_ID = '2';
const LOCALSTORAGE_MESSAGES_KEY = 'messages';
let currentUser = null;
let isSending = false;

// GLOBAL SELECTORS
const app = document.getElementById('app');
const chat = document.getElementById('chat');
const sendMessageBtn = document.getElementById('send-message-btn');
const form = document.getElementById('form');
const messageText = document.getElementById('message-text');
const openChatBtn = document.getElementById('open-chat');
const closeChatBtn = document.getElementById('close-chat-btn');
const messageList = document.getElementById('messages-list');
const username = document.getElementById('username');
const userCity = document.getElementById('user-city');

// ATTACH LISTENERS
document.addEventListener('DOMContentLoaded', initApp);
form?.addEventListener('submit', handleFormSubmit);
openChatBtn?.addEventListener('click', handleOpenModal);
closeChatBtn?.addEventListener('click', handleCloseModal);
document.addEventListener('keydown', handleSendOnEnter);
messageText?.addEventListener('keyup', handleTextAreaHeight);

/**
 * Все функции названы логично и по смыслу.
 *
 * Рейтинг только визуально работает, без логики.
 *
 * Проект особо не рефакторил.
 *
 * Модалка из DOM не выпиливается.
 *
 * Сообщения сохраняются в localStorage и загружаются оттуда же при инициализации.
 *
 * Отправку по Enter отключил на данный момент
 *
 * todo
 * removeEventListeners
 * code  splitting
 * refactor
 *
 * Жду обратной связи. Спасибо.
 */

// INIT APP
function initApp() {
    fillUserInfo();
    getMessagesFromLocalStorage();
    renderAllMessages(messages);
    scrollToLastMessage();
}

function handleFormSubmit(e) {
    e.preventDefault();
    const message = e.target.message.value.trim() ?? '';
    if (message) {
        sendMessage(message);
        form.reset();
    }
}

function fillUserInfo() {
    const user = getUserDataById(CURRENT_USER_ID);
    if (user) {
        username.innerHTML = `${user.firstname} ${user.lastname}`;
        userCity.innerText = user.city;
    }
}

function handleSendOnEnter(e) {
//     if (e.key === 'Enter') {
//         const message = form.message.value.trim() ?? '';
//         if (message) {
//             sendMessage(message);
//             form.message.value = '';
//         }
//     }
}

function sendMessage(messageText) {

    isSending = true;
    sendMessageBtn.disabled = true;
    sendMessageBtn.innerText = 'Отправляем...';

    const newMessage = {
        id: Math.floor(Math.random() * 100),
        userId: CURRENT_USER_ID,
        time: new Intl.DateTimeFormat("ru", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(Date.now()),
        message: messageText,
    }

    messages = [
        newMessage,
        ...messages,
    ]


    setTimeout(() => {
        setMessagesToLocalStorage(messages)
        renderAllMessages(messages);
        scrollToLastMessage();
        paintNodeForAWhile(messageList?.lastElementChild, 'painted', 2000);
        sendMessageBtn.disabled = false;
        sendMessageBtn.innerText = 'Отправить';
        isSending = false;
    }, 1500);


}
// считает количество строк в поле, если больше 4, то увеличиваем до 7
function handleTextAreaHeight(e) {
    const message = e.target.value;
    const lines = message.split(/\r|\r\n|\n/);
    const count = lines.length;
    if (count >= 4) {
        messageText.rows = 7;
    } else {
        messageText.rows = 4;
    }
}

function scrollToLastMessage() {
    messageList?.lastElementChild?.scrollIntoView({behavior: "smooth"});
}

function handleCloseModal() {
    chat?.classList.add('hidden')
}

function handleOpenModal() {
    chat?.classList.remove('hidden')
}

function renderAllMessages(messages) {
    messageList.innerHTML = '';
    messages?.forEach(msg => renderMessage((msg)));
}

function renderMessage(message) {
    const messageWrapper = createElementWithClasses('div', ['message']);
    const avatarWrapper = createElementWithClasses('div', ['message__avatar', 'avatar']);
    const avatar = createElementWithClasses('img');
    const messageText = createElementWithClasses('div', ['message__text']);
    const messageTime = createElementWithClasses('div', ['message__time']);

    const currentUser = getUserDataById(message.userId);

    avatar.src = currentUser?.avatar || '';
    avatar.alt = currentUser?.firstname || '';

    messageText.innerHTML = message.message || '';

    messageTime.innerText = message.time || '';

    if (CURRENT_USER_ID === currentUser.id) {
        messageWrapper.classList.add('my')
    }

    avatarWrapper.prepend(avatar);

    messageWrapper.append(avatarWrapper);
    messageWrapper.append(messageText);
    messageWrapper.append(messageTime);

    messageList?.prepend(messageWrapper);
}

function createElementWithClasses(element, classNames) {
    const el = document.createElement(element);
    if (classNames) {
        el.classList.add(...classNames);
    }
    return el;
}

function getUserDataById(userId) {
    return users.find(user => user.id === userId);
}

function getMessagesFromLocalStorage() {
    const savedMessages = localStorage.getItem(LOCALSTORAGE_MESSAGES_KEY);
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    }
}

function setMessagesToLocalStorage(messages) {
    localStorage.setItem(LOCALSTORAGE_MESSAGES_KEY, JSON.stringify(messages))
}

function paintNodeForAWhile(node, classname = '', delay = 300) {

    node.classList.add(classname);

    setTimeout(() => {
        node.classList.remove(classname)
    }, delay)
}

